title: "Can you mix C++ dynamic memory functionalities with C?"
date: 10-07-2021
tags: c, cpp, assembly, memory
--EOH--

Many times I've seen questions as if we allowed to mix C and C++ dynamic memory libraries and make a code like this:
```cpp
int* val = new int(10);
// some code
free(val);
```
Which is considered a "bad practice", but why is that? Aren't `free()` and `operator delete()` are the same thing?

Well to answer this question, we must first understand the difference between `operator new()` and `malloc()`.

Let's peak into the LLVM libcxxabi to see how they're implementing `operator new()`.
> I'm going to show the main `operator new()` function and not its overloads.

Here is the [source code](https://github.com/llvm-mirror/libcxxabi/blob/master/src/stdlib_new_delete.cpp):
> I minimized the code a bit so we won't need to care about special macros.

```cpp
void* operator new(std::size_t size)
{
    if (size == 0)
        size = 1;
    void* p;
    while ((p = ::malloc(size)) == 0)
    {
        std::new_handler nh = std::get_new_handler();
        if (nh != nullptr) 
            nh();
        else    
            throw std::bad_alloc();
    }
    return p;
}
```
As you can see LLVM `operator new()` implementation uses `malloc()` because there is no need to reinvent the wheel, you just need to make it a bit more safe and make it in a more C++ style.

<br/>

#### But is it safer?
In C `malloc(0)` is perfectly valid, which will _probably_ return a null pointer, but it's not promised since its implementation-defined, so this is a little bit of a problem.
`operator new()` is making sure that you can never pass `0` to it by changing it to `1`, because you never need to allocate nothing.
> If you can enlighten my eyes why would you want to use `malloc(0)` make sure to comment here.

And now you might be asking yourself what is that `while` loop, why not using a simple `if` statement?
To understand this, we must first understand what is `std::new_handler`, according to [cplusplus.com](https://www.cplusplus.com/reference/new/new_handler/):
> This is a typedef of a void function with no parameters, used as the argument and return type in function set_new_handler.
A new-handler function is a function that is called by the standard definition of functions operator new and operator new[] when they fail to allocate memory.

So they basically try to allocate memory again, and again until `std::new_handler` is `nullptr` which will invoke an exception that it couldn't allocate memory - `std::bad_alloc`.

Now that we understand how `new` is working under the hood under LLVM ( which is the same source code as in GCC ), we can already guess how `operator delete()` is written:
```cpp
void
operator delete(void* ptr)
{
    if (ptr != nullptr)
        ::free(ptr);
}
```
We're not surprised it's calling `free()` since they already used `malloc()` in the `operator new()`.

<br/>

#### But is it the same for all compilers or only LLVM and GCC?
Let's see what the [standard](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2014/n4296.pdf) ( § 18.6.1.1 (4.1) ) has to say about it:
> Executes a loop: Within the loop, the function first attempts to allocate the requested storage. **Whether the attempt involves a call to the Standard C library function malloc is unspecified.**

So just because LLVM and GCC using the C library for dynamic memory allocations it does not mean other compilers are using them aswell, therefore it is considered to be bad practice because who knows what will happen if you integrate both libraries into a C++ code that the compiler is not designed the same way. So there is a high chance the code will break or will cause memory leaks.

But now that we saw LLVM source code, let's make a nice simple test to see if our code is indeed actually using `malloc()` and `free()`, lets take a look at the simplest example possible:
```cpp
// filename: new.cpp
int main()
{
    int* val = new int(23)
    delete val;
}
```

> Make sure you have `gdb` installed.

Let's compile it without optimizations ( because we're not doing anything special the optimizations will delete those calls completely ) and with debugging symbols:
```zsh
$ g++ new.cpp -O0 -g
```
And now let's launch our program with `gdb` with a breakpoint in the `main` function:
```zsh
$ gdb a.out
(gdb) break main
(gdb) run
```
Now that we know we're in the first line which is `int* val = new int(23)`, let's disassemble our program:
> I will be using intel syntax because I find it easier to read.

```zsh
(gdb) set disassembly-flavor intel
(gdb) set print asm-demangle on
(gdb) disas
```
> I demanged the names so it's easier to read.

Which will result in:
```x86asm
Dump of assembler code for function main():
   0x0000555555555169 <+0>:	endbr64 
   0x000055555555516d <+4>:	push   rbp
   0x000055555555516e <+5>:	mov    rbp,rsp
   0x0000555555555171 <+8>:	sub    rsp,0x10
=> 0x0000555555555175 <+12>:	mov    edi,0x4
   0x000055555555517a <+17>:	call   0x555555555060 <operator new(unsigned long)@plt>
   0x000055555555517f <+22>:	mov    DWORD PTR [rax],0x17
   0x0000555555555185 <+28>:	mov    QWORD PTR [rbp-0x8],rax
   0x0000555555555189 <+32>:	mov    rax,QWORD PTR [rbp-0x8]
   0x000055555555518d <+36>:	test   rax,rax
   0x0000555555555190 <+39>:	je     0x55555555519f <main()+54>
   0x0000555555555192 <+41>:	mov    esi,0x4
   0x0000555555555197 <+46>:	mov    rdi,rax
   0x000055555555519a <+49>:	call   0x555555555070 <operator delete(void*, unsigned long)@plt>
   0x000055555555519f <+54>:	mov    eax,0x0
   0x00005555555551a4 <+59>:	leave  
   0x00005555555551a5 <+60>:	ret    
End of assembler dump.
```
By the small arrow `=>` on the left we only need to skip one instruction to `operator new` to understand what it does _internally_:
```zsh
(gdb) si
```
Now we're at the call to `operator new()` instruction, let's dive into it by typing again the same command and see its assembly code:
```zsh
(gdb) si
(gdb) disas
```
Results in:
```x86asm
Dump of assembler code for function _Znwm@plt:
=> 0x0000555555555060 <+0>:	endbr64 
   0x0000555555555064 <+4>:	bnd jmp QWORD PTR [rip+0x2f5d]        # 0x555555557fc8 <operator new(unsigned long)@got.plt>
   0x000055555555506b <+11>:	nop    DWORD PTR [rax+rax*1+0x0]
End of assembler dump.
```
Let's go to the branch instruction ( `bnd jmp QWORD PTR[rip + 0x2F5D]` ):
```zsh
(gdb) si
(gdb) si
(gdb) disas
```

Results in:
```x86asm
Dump of assembler code for function _Znwm:
=> 0x00007ffff7e45cb0 <+0>:	endbr64 
   0x00007ffff7e45cb4 <+4>:	test   rdi,rdi
   0x00007ffff7e45cb7 <+7>:	mov    eax,0x1
   0x00007ffff7e45cbc <+12>:	push   rbx
   0x00007ffff7e45cbd <+13>:	cmovne rax,rdi
   0x00007ffff7e45cc1 <+17>:	mov    rbx,rax
   0x00007ffff7e45cc4 <+20>:	mov    rdi,rbx
   0x00007ffff7e45cc7 <+23>:	call   0x7ffff7e36020 <malloc@plt>
   0x00007ffff7e45ccc <+28>:	test   rax,rax
   0x00007ffff7e45ccf <+31>:	je     0x7ffff7e45cd3 <operator new(unsigned long)+35>
   0x00007ffff7e45cd1 <+33>:	pop    rbx
   0x00007ffff7e45cd2 <+34>:	ret    
   0x00007ffff7e45cd3 <+35>:	call   0x7ffff7e36070 <std::get_new_handler()@plt>
   0x00007ffff7e45cd8 <+40>:	test   rax,rax
   0x00007ffff7e45cdb <+43>:	je     0x7ffff7e39613
   0x00007ffff7e45ce1 <+49>:	call   rax
   0x00007ffff7e45ce3 <+51>:	jmp    0x7ffff7e45cc4 <operator new(unsigned long)+20>
End of assembler dump.
```
Hm... We can already tell that it's calling `malloc()` and `std::get_new_handler`, exactly like the LLVM source code did, if we would also look at the last `jmp` instruction we can tell that it's going back to `mov rdi, rbx` where `malloc` is about to be called, so indeed there is also a loop here exactly like the LLVM source code.

Here is a translation of the assembly code:
```x86asm
Dump of assembler code for function _Znwm:
=> 0x00007ffff7e45cb0 <+0>:	endbr64                                                         ; Terminating an indirect branch - not getting into it.
   0x00007ffff7e45cb4 <+4>:	test   rdi,rdi                                                  ; if(rdi == 0)
   0x00007ffff7e45cb7 <+7>:	mov    eax,0x1                                                  ;       eax = 0x1
                                                                                            ; -- Remember from LLVM? 
                                                                                            ; if (size == 0) 
                                                                                            ;       size = 1;
   0x00007ffff7e45cbc <+12>:	push   rbx                                                  ; calling conventions - not getting into it.
   0x00007ffff7e45cbd <+13>:	cmovne rax,rdi                                              ; Not sure what this is...
   0x00007ffff7e45cc1 <+17>:	mov    rbx,rax                                              ; rbx = rax
   0x00007ffff7e45cc4 <+20>:	mov    rdi,rbx                                              ; rdi = rbx
   0x00007ffff7e45cc7 <+23>:	call   0x7ffff7e36020 <malloc@plt>                          ; malloc(rdi)
   0x00007ffff7e45ccc <+28>:	test   rax,rax                                              ; if(rax == 0)
                                                                                            ; -- Remember?
                                                                                            ; while ((p = ::malloc(size)) == 0)
   0x00007ffff7e45ccf <+31>:	je     0x7ffff7e45cd3 <operator new(unsigned long)+35>      ; Jump inside the loop if condition is met.
   0x00007ffff7e45cd1 <+33>:	pop    rbx                                                  ; calling conventions - not getting into it.
   0x00007ffff7e45cd2 <+34>:	ret                                                         ; return
                                                                                            ; -- Remember? 
                                                                                            ; return p;
   0x00007ffff7e45cd3 <+35>:	call   0x7ffff7e36070 <std::get_new_handler()@plt>          ; std::get_new_handler()
   0x00007ffff7e45cd8 <+40>:	test   rax,rax                                              ; if(rax == 0)
   0x00007ffff7e45cdb <+43>:	je     0x7ffff7e39613                                       ;       jump to std::bad_alloc
   0x00007ffff7e45ce1 <+49>:	call   rax                                                  ; else
                                                                                            ;       rax();
                                                                                            ; -- Remember?
                                                                                            ; std::new_handler nh = std::get_new_handler();
                                                                                            ; if(nh == nullptr)
                                                                                            ;       throw std::bad_alloc();
                                                                                            ; else
                                                                                            ;       nh();
   0x00007ffff7e45ce3 <+51>:	jmp    0x7ffff7e45cc4 <operator new(unsigned long)+20>      ; go back to the while loop and try again.
End of assembler dump.
```
> Feel free to comment here to fill in the blanks that I wasn't sure what was it doing, or if I did something wrong.

And for `operator delete()` you can try to see it for yourself, but it's also calling `free()` as above. :)

<br/>
### In summary:
* LLVM and GCC `operator new()` are using C dynamic memory library internally.
* `operator new()` is more safe than `malloc()`.
* It's not guaranteed that every compiler is using `malloc()` in their `operator new()` implementation, therefore it's considered a bad habit to mix both C and C++ dynamic memory functionality.

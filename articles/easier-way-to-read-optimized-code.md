title: "Easy Way to Examine Optimized Code"
date: 10-07-2021
tags: compiler, gcc, c, cpp, assembly, optimization, recursion
--EOH--

Lately, I've been doing a sine function in ANSI C by using [Taylor Series](https://en.wikipedia.org/wiki/Taylor_series) and [Tail Call Recursion](https://en.wikipedia.org/wiki/Tail_call) and I wanted to see if the compiler managed to perform [Tail Call Optimization](https://en.wikipedia.org/wiki/Tail_call), and obviously it's not so nice to look at its assembly and understand it, so I looked for a different way by assigning GCC a flag.

### Introducing Tree Dump Files
Consider the following C code:
```c
void print_hello() {
    printf("Hello World!\n");
}
```
You might be telling yourself that the compiler can't optimize something here, but in a matter of fact, it can! Since we only printing text and going to the next line we can optimize this call to be using `puts()` rather than `printf()` which is a bit faster ( You can benchmark it! ) because it does not need to perform string parsing.
Let's take a look at its assembly code so it indeed was being optimized:
```x86asm
.LC0:
        .string "Hello World!"
print_hello():
        mov     edi, OFFSET FLAT:.LC0
        jmp     puts
```
Yay, GCC managed to optimize it!

But if we dealing with much bigger and complex functions looking at this piece of code is definitely not nice, therefore we can use the `-fdump-tree-all` flag for GCC, which will dump a bunch of tree files during its compilation stages, we are not interested in all of them, so I'm going to map them so it won't spam the entire folder with them, the one we're interested in is the "optimized" file.
Let's compile it again with GCC and our new flag:
```zsh
$ gcc test.c -O3 -fdump-tree-all
```
> Warning: You better do that in a folder because it's going to generate a lot of files.

Now lookup for a file with the word optimized in it, you can do that fast by writing:
```cpp
$ ls | grep optimized | xargs emacs &
```
> You can replace emacs by a different text editor.

The content of the file is probably like this:
```c
;; Function print_hello (_Z11print_hellov, funcdef_no=30, decl_uid=3069, cgraph_uid=31, symbol_order=30)

print_hello ()
{
  <bb 2> [local count: 1073741824]:
  __builtin_puts (&"Hello World!"[0]); [tail call]
  return;
}


;; Function main (main, funcdef_no=31, decl_uid=3071, cgraph_uid=32, symbol_order=31) (executed once)

main ()
{
  <bb 2> [local count: 1073741824]:
  __builtin_puts (&"Hello World!"[0]);
  return 0;
}
```

Before I talk about what happened here, I'm going to talk about those weird function parameters and function content:
* First Parameter - In our `print_hello()` function we can see that the first parameter is a bit weird, this parameter is for name mangling, we can view the actual parameter by using `c++filt` like so: `$ c++filt _Z11print_hellov` which will print `print_hello()` ( If you used a C compiler this shouldn't be a problem ).
* `funcdef_no` - Is the Function Definition Number, every basic block that is belonging to a function has a unique number.
* `decl_uid` - Is the function Declaration Unique Identifier. In our GCC tree, there is a function declaration tree, then that is the unique identifier in the tree.
* `cgraph_uid` - Call Graph Unique Identifier. Is the unique identifier in the call graph ( or control-flow graph ) that represents the relationship between parents and child functions in the program.
* `symbol_order` - Is the Call Graph node order.
* `bb`- Is the Basic Block. BB is a set of statements that do not have any _in_ and _out_ branches except _entry_ and _exit_.
* `local count` - Is the BB Counting, keeping track of how many times each basic block is executed.

> Don't worry if you didn't get all of them, I just briefly explained them because they're not so important for us.

Now it's time to examine our optimized file!
* As you can see our BB number is 2 in both functions, which means that the `print_hello()` function must have been inlined, also another indicator for that is the `(executed once)` beside our function parameters.
* Notice that GCC decided to call to `__builtin_puts()` which is the underlying implementation of `puts()` in GCC.

Let's examine a slightly more complex function:
```c
void infinite_print()
{
    printf("Hey there!\n");
    infinite_print();
}

int main()
{
    infinite_print();
}
```

Let's dump its tree files, and see the optimized file:
```c
;; Function infinite_print (infinite_print, funcdef_no=11, decl_uid=2381, cgraph_uid=12, symbol_order=11) (executed once)

Merging blocks 3 and 4
void infinite_print ()
{
  <bb 2> [local count: 10631108]:

  <bb 3> [local count: 1073741824]:
  # DEBUG BEGIN_STMT
  __builtin_puts (&"Hey there!"[0]);
  # DEBUG BEGIN_STMT
  goto <bb 3>; [100.00%]

}


;; Function main (main, funcdef_no=12, decl_uid=2383, cgraph_uid=13, symbol_order=12) (executed once)

int main ()
{
  <bb 2> [local count: 1073741824]:
  # DEBUG BEGIN_STMT
  infinite_print ();

}
```

Let's examine it!
* We can already tell that the `printf()` called was optimized to `puts()`.
* We can also see that the compiler eliminated the recursion by using a `while(true)` instead ( More specifically: `goto` ), Another way to see this is to run the code and not seeing a Stack Overflow error.

Now let's take it a bit further! Remember the `cgraph` parameter for the Call Graph? Let's ask GCC to nicely display it!
```zsh
$ gcc test.c -O3 -fdump-tree-all-graph
```
It will generate a bunch of files again, we are interested in the `optimized.dot` file, let's convert it to an image so we can see it: ( Make sure you have `dot` installed. )
```zsh
$ dot -Tpng optimized.dot > optimized.png
```
Which will result in:

![optimized.dot](https://user-images.githubusercontent.com/22757058/113173490-17405e00-9252-11eb-965f-f877892d826c.png)

There are many cases that we could use it either in C or C++, especially when dealing with lots of weird functions. I hope you learned something new, and make sure to leave feedback!

> I also submitted a suggestion to [Compiler Explorer](https://github.com/compiler-explorer/compiler-explorer) about it, you can view it [here.](https://github.com/compiler-explorer/compiler-explorer/issues/2547)

title: "Allocating Memory"
date: 27-04-2021
tags: c, cpp, memory, gdb, pointers, address, stack, heap
--EOH--

# Allocating Memory

In C/C++ there are different ways of allocating memory, each way allocating the memory in different areas in our computer memory, I'm going to explain how to allocate in both ways.  
Don't expect to understand what exactly is a stack, heap, or how memory is being handled by our program, this article designed to explain _how to allocate memory_, and not how it works.

What I'm going to talk about:

* Stack memory allocations.
* Memory addresses.
* Pointers.
* De-references.
* Null pointers.
* Operator -&gt;.
* void\*.
* C++ references. \( specifically lvalue references \)
* Heap memory allocations.
* Arrays.
* C++ smart pointers.

### Stack Allocated Memory

This is the way that beginners first learn when allocating memory which is to allocate memory on the stack.

Beginners learn this way first because it's the easiest way to allocate memory without any use of pointers,  and because it's very straightforward.

Example to allocate memory on the stack is:

```c
int i_value = 54;                  // allocated on the stack.
double d_value = 54.84;            // allocated on the stack.

struct Vector2f {
    float x, y;
};
Vector2f vec = { 0.5f, 54.f };     // allocated on the stack.
```

> Note that every variable type has a different size on different architectures.


### Address

A memory address is a location in the computer memory where the variable was assigned, you can retrieve the address of every stack-allocated variable with the addressof operator `&` and see where it was allocated:

```c
int value = 54;
printf("Value: %d, Address: %0Xd", value, &value);
```

The program should print the value and the address that it was assigned.

> Value: 54, Address: 0x7ffca2c2d90c


> Note: due to different hardware, and different running times, the address will be also different. Meaning that every time you run this program you will get a different memory address.

### Pointers

Pointers are special variables that point to a memory address.  
Pointers has the same size \( the size will be different from every architecture \), even if the variable type size is huge.  
You can identify pointers with their signature: `*`.

Here is an example:

```c
struct Vector3d {
    double x, y, z;
};

printf("sizeof(int) = %d, and sizeof(int*) = %d\n", 
        sizeof(int),          sizeof(int*));
printf("sizeof(double) = %d, and sizeof(double*) = %d\n", 
        sizeof(double),          sizeof(double*));
printf("sizeof(Vector3d) = %d, and sizeof(Vector3d*) = %d\n", 
        sizeof(Vector3d),          sizeof(Vector3d*));
```

This program should print this on _32bit_:

> sizeof\(int\) = 4, and sizeof\(int_\) = 4  
> sizeof\(double\) = 8, and sizeof\(double_\) = 4  
> sizeof\(Vector3d\) = 24, and sizeof\(Vector3d\*\) = 4

The reason all pointers have the same size is that the size is not being determined by the actual variable type size, but it's being determined by the actual address size.

### Combining Pointers and Addresses

Now that we understand what pointers are in general, and what are addresses, we can make a pointer to point to an address, by combining both signatures.

```c
int value = 54;
int* p_value = &value;
```

We just created a pointer `p_value` that points to our `value` address!  
But since our `p_value` is a pointer that points to an address, it's actual form is the address, not the value that we think, every change that we will make to our `p_value` will actually change the address of that pointer and not the actual value underlying that address, in order to access that value we must first de-reference it.

An example that proves my point:

```c
printf("Value: %d", p_value);
```

This example will print the address of `p_value` and not the number `54` as we would expect.

### De-referencing

Every pointer simply holds the address memory and not the actual value, in order to obtain that value and operate on it we must de-reference it, we do it with the same signature of the pointer signature but in a different position.

Here is an example:

```c
int value = 54;
int* p_value = &value;
*p_value = 180;
```

As you can see we used the pointer signature before `p_value` and assigned to it a number \( line 3 \), this is called de-referencing, we can think of this entire code like this:

1. Create a variable of type `int` with the value of `54` as `value`.
2. Create a pointer to `value` address as `p_value`.
3. Access the value that `p_value` is pointing to and change it to `180`.

If we would print our `value` we would get `180`.

### Null Pointers

In all of the examples I showed here I always assigned an address to a pointer, but what if we want to make our pointer not point to anywhere \( kind of like an "empty pointer" \), how would we do that? well obviously can do this:

```c
int* p_value;
```

This is a null pointer \( a pointer that does not point anywhere \), it looks great, but it's actually dangerous, and it's considered bad practice.

After we initialized our `p_value` all of a sudden we forgot that it's null \( happens a lot \), and we try to de-reference it to access the actual value, like so:

```c
printf("value = %d", *p_value);
```

We would get this under _32bit_ this:

> value = -16736883

We would expect this program to crash, but apparently, it didn't, let's see what happens when we assigned null to it:

```c
int* p_value = NULL;
printf("value = %d", *p_value);
```

And the output was:

> segmentation fault \(core dumped\)

The program was crashed with a weird error, that error is telling you that you tried to do something that is forbidden with the memory.

> Note: If you're using `gdb` it's very easy to debug with the `backtrace` instruction, and find what happens in your program.

Now imagine you're working on a very important project with your team, all of the sudden the program runs weird and everyone is trying to figure out what's wrong, you and your team are spending hours trying to figure out what happened in the process when all you could have to do is mark the pointer as null, and debug it with `gdb`.

Now you probably asking yourself what does `NULL` do that forcing our program to break, this can be answered easily when looking at how `NULL` usually implemented:

```c
#define NULL 0
#define NULL (void*)0
```

Both of them are the common implementation that many compilers use, they simply make the pointer points to the first address rather than letting the compiler choose where it should be pointed, which may or may not hold some value.

In C++ we are allowed to overload functions, for example:

```c
void foo(int)  { printf("foo(int)"); }
void foo(int*) { printf("foo(int*"); } 
```

After we saw the first `NULL` implementation, we could guess what would happen if we pass `NULL` to `foo.`

```c
foo(NULL);
```

Some compilers _could_ print:

> foo\(int\)

And it's very incorrect, since `NULL` represents a null pointer, to fix this problem C++ introduced the `nullptr` keyword:

```c
foo(nullptr);
```

That would print as expected:

> foo\(int\*\)

### The Arrow -&gt; Operator

So far I talked about pointers with primitives rather than structures, but accessing structure members are a bit different from what we would expect.

For example, we have a vector structure:

```cpp
typedef struct {
    float x, y;
} Vector3f;
```

And we want for some reason a function to swap the vector values:

```cpp
void swap(Vector3f* p_vec)
{
    float temp = (*p_vec).x;
    (*p_vec).x = (*p_vec).y;
    (*p_vec).y = temp;
}
```

Notice how we de-referenced our `p_vec` and access its members, but this code is a bit ugly, so thanks to C we have the `->` operator!  
Let's modify to do the same thing but in a more readable way:

```cpp
void swap(Vector3f* p_vec)
{
    float temp = p_vec->x;
    p_vec->x = p_vec->y;
    p_vec->y = temp;
}
```

### The C Generic Type - void\* 

Before C++ introduced templates many C libraries wanted to pass different types to a function and one of the ways to do it in C was by using the `void*`.  
`void*` would hold different addresses and would allow you to cast them to the type you would like without explicit cast.

>  Note: if you're planning on allowing C++ compilers to compile your C code, make sure you explicitly cast the types.

Here is a simple example:

```c
void send(void* p_data, unsigned int dest);
```

This function would send the unknown bytes of data to some destination.

### C++ References

If we wanted to get a pointer to a variable without getting `NULL` we would probably need to something like this:

```cpp
void foo(int* pval)
{
    if(pval != NULL)
    {
        // Do Something
    }
    else
        // Error Occured
}

// OR
void foo(int* pval)
{
    assert(pval);
    // Do Something
}
```

Clearly, this is ugly, and we wouldn't want to do it for every function like that, that's one of the reasons C++ introduced references: `&`\( Same signature as Address \).

Here is the same code but in C++:

```cpp
void foo(int& val)
{
    // Do Something
}
```

Isn't it nice? if we would try to pass `NULL` or `nullptr` we would get compile-time error from our compiler, this is not only where it shines, now you can say goodbye to de-referencing, so if you want to change `val` to something else then you don't have to write `*val = some_value` anymore, but it does not mean that it doesn't do de-referencing anymore, it still does, but it's doing it on its own.

Obtaining the address of `val` is the same way as you would do with pointers, just call the addressof operator for your variable or use [`std::addressof`](https://en.cppreference.com/w/cpp/memory/addressof).

It looks good so far right? you probably asking yourself "but what are the advantages pointers have over references?", here they are:

* References must be initialized, meaning that this `int& ref;` is invalid.
* References cannot switch addresses, meaning that this is invalid:

```cpp
int value1 = 54;
int value2 = 88;

int& ref = value1;
ref = value2; // invalid
```

> Note: Most modern compilers are generating the same assembly code as it would be with pointers.

### Heap Allocated Memory

Finally, we made it here!  
Heap memory allocations are considered sometimes as manual memory since we are the owners of the lifetime of the memory, it's the same as dynamic memory allocation.

Dynamic memory allocation allows us to ask the operating system for memory at runtime, and make more space in the second area of the computer memory.

We asking the operating system for dynamic memory by using the C functions `malloc` or `calloc` or `realloc`, or by using the C++ operators `new` or `new[]`.

> Note: Every memory that was allocated dynamically needs to be deleted manually, or you would get memory leaks.

First, let's see the signature of our C dynamic memory allocation family:

```c
void *malloc(size_t size);                 // Memory Allocation
void *calloc(size_t nitems, size_t size);  // Contiguous Allocation
void *realloc(void *ptr, size_t size);     // ReAllocation
void free(void *ptr);                      // Free Memory
```

> `size_t` is an unsigned type, its size is different between various compilers and architectures.

We can tell that our allocation functions return `void*` which is the data that our operating system allocated for us, so we can assign them to our pointer, and use that memory.  
Those functions are expecting a size in bytes, so if we would want to allocate memory to our variable, we need to pass its size to one of those functions.  
I will talk about `realloc` in the Arrays section.

```c
int* mal_val = malloc(sizeof(int));
int* cal_val = calloc(1, sizeof(int));
```

They both do almost the same thing in this case, except that our `mal_val` was left uninitialized and our `cal_val` value is `0`.

> Always make sure that `malloc` / `calloc` or `realloc` succeed by checking if they equal to null.

Now that we allocated their memory we must free it so we won't cause any memory leaks:

```c
free(mal_val);
free(cal_val);
```

Now, let's take a look at C++ `new` and `delete` , here are their signature \( [as long as many overloads](https://en.cppreference.com/w/cpp/memory/new/operator_new) \):

```cpp
void *operator new(size_t count);
void operator delete(void *ptr) noexcept;
```

Despite their signature, C++ is allowing us to allocate memory without specifying its size, like this:

```cpp
int* val = new int;
```

But if we would want to specify its size for some reason, we could do that by calling the operator directly:

```cpp
int* val = operator new(sizeof(int));
```

> Note: C++ may throw if it wasn't able to allocate the memory.

And again, don't forget to delete its memory.

```cpp
delete val;
```

> There are many tools to check for memory leaks:
>
> * Static Analyzers. \( Such as `clang-tidy`, and the `-fanalzyer` flag for GCC \)
> * Profilers. \( Such as `valgrind` \)

### Arrays

Allocating arrays on the stack is the easiest way, simply by calling the `[]` operator:

```cpp
int arr[10];
```

We allocated an array with the size `10` on the stack, but sometimes we don't know the size at compile-time, so we must allocate the memory at runtime, that's where heap-allocated arrays are coming to play.

Thanks to what we learned at the "Heap Allocated Memory" section, we can use those keywords to allocate our memory on the heap:

```c
int* arr      = malloc(sizeof(int) * 10);
int* arr_init = calloc(10, sizeof(int));
```

Both ways are valid, except that the `calloc` function, as we know is going to initialize all of the array elements to `0`, but this is the C way, let's take a look at the C++ way:

```cpp
int* arr      = new int[10];
int* arr_init = new int[10]();
```

Both arrays are the exact same arrays as the C-style way, just in a different syntax.

There are many cases where we would need to increase or shrink our arrays for some reason, for C there's the `realloc` function:

```cpp
arr = realloc(arr, sizeof(int) * (10 + 10));
```

Here we simply specified the original size of our array \( which is `10` \) and we increased it by `10`, C++ doesn't give us a way to change our dynamically allocated array by using `new` so we would need to copy the entire content to a new dynamically allocated array:

```cpp
int* cpp_int_realloc(int* src, size_t original_size, size_t new_size)
{
    if(new_size < original_size)
        return nullptr; // error
    
    int* dest = new int[new_size]();
    
    // copy all elements
    for(size_t i = 0; i < original_size; ++i)
        dest[i] = src[i];

    delete[] src;

    return dest;
}
```

We can read this code as follows:

1. Make sure that our `new_size` is bigger than `original_size` \( This function is unable to shrink arrays \), so we won't get a segmentation fault.
2. Create a new array as a destination with our `new_size`.
3. Copy everything from our `src` array to our `dest` array.
4. Clean up our `src` array, so we won't get any memory leaks.
5. Lastly, return our new sized array!

We can use this function as follows:

```cpp
size_t size = 10;
int* arr = new int[size]();
arr = cpp_int_realloc(arr, size, size + 10);
```

> This function was only to show how we can accomplish `realloc` in C++, and shouldn't be used in actual programs, [`std::vector`](https://en.cppreference.com/w/cpp/container/vector) should be preferred.

Did you notice that we used a different operator to de-allocate our memory? in C we would delete our memory simply by calling `free`, C++ offers a different operator specifically designed to delete arrays of objects by using `delete[]`.

```cpp
delete[] arr;
```

The `delete[]` operator will iterate through all of the objects and will call each destructor, while the `delete` operator will cause memory leaks when dealing with arrays of C++ classes.

Here is an example:

```cpp
class A 
{
    int* arr;
    
public:
    A()  { arr = new int[10]; }
    ~A() { delete[] arr;      }
};

A* objects = new A[10];

delete objects;   // segmentation fault
delete[] objects; // okay
```

### C++ Smart Pointers

Since we know that every time that when we want to allocate memory on the heap, we must also delete it when we are not using it, this is a problem since it's very easy to forget to delete that memory, especially when working on big projects, C++ gives a solution to this, and they are called smart pointers.

C++ gives us 4 different types of smart pointers, I'm going to talk about them very briefly.

* [`std::unique_ptr`](https://en.cppreference.com/w/cpp/memory/unique_ptr) is the basic smart pointer of them all, it's deallocating the memory when we reach the end of the scope.

```cpp
{
    std::unique_ptr<int> ptr = std::make_unique<int>();
    // Some Code
} // Deallocated ptr
```

* [`std::shared_ptr`](https://en.cppreference.com/w/cpp/memory/shared_ptr) has a reference count mechanism and when there are no references to that pointer, it's get deleted.

```cpp
void foo(std::shared_ptr<int> ptr) {
    std::cout << ptr.use_count() << "\n"; 
}

void bar(std::shared_ptr<int> ptr) {
    foo(ptr); 
}

int main()
{
    std::shared_ptr<int> ptr = std::make_shared<int>();
    
    foo(ptr); // prints 2
    bar(ptr); // prints 3

    std::cout << ptr.use_count() << "\n"; // prints 1

} // Deallocated ptr
```

* [`std::auto_ptr`](https://en.cppreference.com/w/cpp/memory/weak_ptr)takes a `std::shared_ptr` but does not increase its reference count.

```cpp
void foo(std::weak_ptr<int> ptr) {
    std::cout << ptr.use_count() << "\n"; 
}

int main()
{
    std::shared_ptr<int> ptr = std::make_shared<int>();
    
    foo(ptr); // prints 1

    std::cout << ptr.use_count() << "\n"; // prints 1
}
```

* [`std::auto_ptr`](https://en.cppreference.com/w/cpp/memory/auto_ptr) \( removed \) is a smart pointer similar to `std::unique_ptr` but when passing it to another smart pointer, it's copying the ptr itself \( very dangerous \).

```cpp
auto ptr = std::auto_ptr<int>(new int(10));
std::auto_ptr<int> copy = ptr;

std::cout << *copy << "\n"; // prints 10
std::cout << *ptr << "\n";  // segmentation fault, pointer was moved to copy.
```

### My Personal Best Practices

* Always use `assert()` when passing pointers to functions.
* If possible, prefer references over pointers.
* Prefer smart pointers over raw pointers when allocating dynamic memory.
* If possible, use `std::unique_ptr` over `std::shared_ptr` .
* Always initialize pointers to null.
* Prefer `nullptr` over `NULL`.
* Prefer `new` over `malloc`.
* Don't mix the C family of dynamic memory allocation with the C++ family.
* Prefer `std::vector` over raw pointer arrays.
* Prefer templates over `void*`.
* Prefer `structure->member` over `(*structure).member`.

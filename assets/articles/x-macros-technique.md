title: "The Relatively Unknown Macro Technique"
date: 17-07-2021
tags: c, macros, x-macro
--EOH--

If you're a programmer that has been programming for decades, you probably already have seen this technique, this technique was vastly popular around the 60', where speed played a much bigger role than nowadays, and where compilers weren't as smart as today.
Many people nowadays still aren't aware of this "special" macro technique, so it remains relatively unknown.

#### What are X Macros?
X Macros are an advanced preprocessor technique to form parallel lists which can be very powerful to create a self-maintaining and interdependent code, it is commonly used among operating system developers.

It is composed by using nested macros by _defining_ the list elements and then _expanding_ them to generate a piece of code:

Definition:
```c
#define NAMES \
    X(ONE)    \
    X(TWO)    \
    X(THREE)  
    // etc...
```
Expansion:
```c
#define X(name) printf("%s\n", #name); /* Piece of code */
    NAMES
#undef X
```

Which should output:
```
ONE
TWO
THREE
```

But... How did it work? Let's take a look at what the compiler did during its preprocessing stage:
> In GCC and Clang, you can pass the flag `-E` to tell it to output the entire code after the preprocessing stage.

```c
int main()
{
    printf("%s\n", "ONE");  printf("%s\n", "TWO");  printf("%s\n", "THREE");
}
```

> Yeah, The alignment is not great.

As you can see it generated 3 `printf`'s that each is printing the name in our `NAMES` list, so what happened here is that our `NAMES` was expecting a macro named `X` and passed to that macro a parameter ( which is the name ), and then we defined our `X` macro that expecting a parameter and printing it.

Let's take a look at a bit more useful and complex case, Let's create a smart enumerator for C:

First of all, We need to create our enum list, we won't do that with the `enum` type, but we will use our X Macro list instead:
```c
#define XCOLORS \
    X(RED)      \
    X(GREEN)    \
    X(BLUE)     \
    X(WHITE)    \
    X(BLACK)
```

Now, we will create our `enum` with our X Macro to hold all of the enum members:
```c
enum Colors {
#define X(color) color,
    XCOLORS
#undef X
};
```

Now that we did that, Let's create utility functions, we will create an enum `size` function and a `to_string` function.

Getting the size of our enum type:
```c
size_t enum_colors_size()
{
    int idx = 0;
    
#define X(color) idx++;
    XCOLORS
#undef X

    return idx;
}
```

Getting the name of our current enum holder:
```c
const char* enum_colors_to_string(enum Colors color_value)
{
    switch(color_value)
    {
#define X(color) case color: return #color;
        XCOLORS
#undef X
    }

    return "Unknown";
}
```

Beautiful, isn't it? You can keep adding colors to `XCOLORS` and you won't need to change a thing! :)

Note, that I do not recommend using it for this purpose, it was just an example ( If you're using C++ and looking for something like this, make sure to look to [magic_enum](https://github.com/Neargye/magic_enum) ), but I'm sure you might find good cases for this, [Here is an example of me finding it useful with OpenGL](https://gist.github.com/therealcain/c97952f3f1930a5e70c97d4f0dba9ec8), also remember that C++ has templates, you might want to use that first.

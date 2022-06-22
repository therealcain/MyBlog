title: "How to make your shell savage"
date: 22-09-2021
tags: bash, zsh, linux, shell
--EOH--

This is a fun feature that some programmers like to add to their Linux machine, which will make your shell insult you when you typing an incorrect/misspelled command.

Here is an example:
```
$ rubbish-command
rubbish-command: command not found
C'mon.. This is all you've got?
```

### How does it work?
Both *bash* and *zsh* have configurations somewhere on the system, nowadays those configurations are located in the `/etc` folder, so if we will look for bash in the configuration folder:
```
$ find . -name "bash*" 2>/dev/null
./apparmor.d/abstractions/bash
./bash.bashrc
./bash_completion
./bash_completion.d
./profile.d/bash_completion.sh
```
> The `2>/dev/null` is to "skip" all error messages, by redirecting them to `null`.

If we will peek into `./bash.bashrc`, we would see something like this at the end:
```sh
# if the command-not-found package is installed, use it
if [ -x /usr/lib/command-not-found -o -x /usr/share/command-not-found/command-not-found ]; then
        function command_not_found_handle {
                # Insults goes here
                # check because c-n-f could've been removed in the meantime
                if [ -x /usr/lib/command-not-found ]; then
                   /usr/lib/command-not-found -- "$1"
                   return $?
                elif [ -x /usr/share/command-not-found/command-not-found ]; then
                   /usr/share/command-not-found/command-not-found -- "$1"
                   return $?
                else
                   printf "%s: command not found\n" "$1" >&2
                   return 127
                fi
        }
fi
```

Now that we found the function that checks if a command was misspelled, we can add to the bottom a simple `echo` that insults us.

In *zsh* it's a bit different, instead of looking for *bash* in the `etc` folder we need to look for *zsh* and find its configuration file:

```
$ find . -name "zsh*" 2>/dev/null
./zsh
./zsh/zshenv
./zsh/zshrc
./zsh_command_not_found
```

We can already identify the file that we want, `./zsh_command_not_found`, which looks simpler:
```sh
if [[ -x /usr/lib/command-not-found ]] ; then
        if (( ! ${+functions[command_not_found_handler]} )) ; then
                function command_not_found_handler {
                        # Insults goes here
                        [[ -x /usr/lib/command-not-found ]] || return 1
                        /usr/lib/command-not-found --no-failure-msg -- ${1+"$1"} && :
                }
        fi
fi
```

After we added our insult, we need to reload the file, we do that simply by calling `source`:
```
$ source /etc/bash.bashrc
$ source /etc/zsh_command_not_found
```

Easy, isn't it?

If you know shell scripting you can make an array of insults and peek a random one every time it fails, to make things a bit spicier:
```
ArrayOfInsults[0]="C'mon are you really that dumb?"
ArrayOfInsults[1]="I thought you can do better than this."
ArrayOfInsults[2]="Maybe it's time to take a break."

index=$[$RANDOM % ${#ArrayOfInsults[@]}]
echo ${ArrayOfInsults[$index]}
```

title: "Making a Mouse with Arduino and an Analog Joystick"
date: 19-11-2021
tags: cpp, python, arduino, electronics, mouse, serial
--EOH--

I forgot that I bought an Arduino Radio-frequency identification (RFID) Kit a few years back, so I thought about putting it to good use, and making my mouse with a joystick controller, and so I did.


## Preparation

Before we start, you will need the following components:

* Arduino Uno
* Analog Joystick
* Potentiometer (Optional)
* 8 Jumper Cables (Male to Female)

And we will also need [Python](https://www.python.org/downloads/), and install `mouse` and `pySerial`:

> $ pip install pySerial
>
> $ pip install mouse



## Connecting the Components

> I'm going to assume you have a bit of a background with Arduino, and that you have Arduino IDE installed.

Before connecting the Arduino to the computer, let's connect the Analog Joystick to Arduino, We will need 5 jumper cables for it.

![Analog Joystick](https://i.imgur.com/weMcKTF.jpeg)

As you can see, we got GND (Ground), +5 volts, X and Y axis, and the Switch (Button).
We need to connect:

1. GND to GND (on Arduino).
2. +5V to 5V (on Arduino).
3. VRX to A0 (Analog 0).
4. VRX to A1 (Analog 1).
5. SW to Digital Pulse Width Modulation (PWM) No.2.

Now, that we connected that, let's connect the Potentiometer:

![Potentiometer](https://i.imgur.com/Br2zZ4u.jpeg)

We don't have anything written down on what is what, so remember that:

1. The bottom PIN is GND, connect to GND on the Arduino.
2. The middle PIN is Data aka Output, connect that to Analog 2 (A2).
3. The first PIN is Voltage Common Collector (VCC), connect that to 5V.



The ending result should look like this:

![Result](https://i.imgur.com/FVsN41P.jpg)



## Programming the Arduino

Let's make constants for all of our PINs:

```cpp
static constexpr auto SwitchPin = 2u; // digital
static constexpr auto XPin      = 0u; // analog
static constexpr auto YPin      = 1u; // analog
static constexpr auto B5KPin    = 2u; // analog
```

In order to talk with Python, later on, we need to open a serial. We also need to prepare our switch pin in the joystick:

```cpp
void setup()
{
    pinMode(SwitchPin, INPUT);
    digitalWrite(SwitchPin, HIGH);
    
    Serial.begin(9600); // rate: 9600
}
```

Now we need to make our loop, it's going to send the data that was received from the Arduino to the serial:

```cpp
void loop()
{
    Serial.print(digitalRead(SwitchPin) == 0);
	Serial.print(":");
	Serial.print(analogRead(XPin));
	Serial.print(":");
	Serial.print(analogRead(YPin));
	Serial.print(":");
	Serial.print(analogRead(B5KPin));
	Serial.print(";");
}
```

The output should be something like this:

```
0:505:515:476;
```

The colon meant to be like a separator:

1. The first one is the `digitalRead`, meaning, whether you pressed the joystick switch or not.
2. For the rest of our analogs, the value varies from 0 to 1024, X-axis, Y-axis, and lastly the Potentiometer.

The semicolon at the end is meant to indicate that the data is done.

I did it this way. But sending data like this is not very efficient, a better way is to encode all of them into a single 64-bit integer:

```cpp
union Data {
    uint64_t encoded;
    struct {
        uint16_t sw  	: 1;
        uint16_t x   	: 16;
        uint16_t y   	: 16;
        uint16_t p   	: 16;
        uint16_t unused : 15;
    };
};

void loop()
{
    Data data;
    data.sw = digitalRead(SwitchPin) == 0;
    data.x  = analogRead(XPin);
    data.y  = analogRead(YPin);
    data.p  = analogRead(B5KPin);
    
    Serial.print(data.encoded);
}
```

And then you can decode it in Python or any other language, just make sure you decode it with the correct endianness.



## Programming in Python

First of all, let's import all of the libraries that we need (The ones you installed at the beginning):

```python
import serial
import mouse
import math
```

Now, as most Python apps, we need to define the main function:

```python
def main():
    return

if __name__ == "__main__"
	main()
```

In our main function, we need to connect to the serial port (I'm connected to `COM3`, you probably not), at the same rate that we are sending the data:

> Check in Arduino IDE, how you uploaded the data, through which serial port.
> On Windows, it should be something like `COM3`.
> On Linux, it should be something more like `/dev/ttyACM0`.

```python
def main():
    # Edit the COM3 to your serial port.
    ser = serial.Serial('COM3', 9600)
    if ser.isOpen():
        print("Connected to " + ser.portstr)
    else:
        print("Failed to connect.")
        return
    
    # We'll talk about this in a moment.
    read_serial(ser)
    
  	ser.close()
```

Before you proceed, make sure that the program prints "Connected to PORT".

Let's create another function, that will read from the serial:

```python
def read_serial(ser):
	string = ""
	while True:
		for c in ser.read():
			if chr(c) == ";":
                # We'll talk about this in a moment.
				data_handler(string.split(':'))
				string = ""
			else:
				string += chr(c)
```

We're iterating through each character that was passed from the Arduino, and looking for a semicolon, because that will tell us that the string has ended, once we do that, we can split the separators and send the data to proceed.

The data from `ser.read()` is an integer formed as ASCII, we cast it with `chr` to a normal character, so we don't just push numbers onto the string, and we clear the string once a semicolon has reached.

Let's create now our `data_handler`, first thing is to cast the tokens to the correct types:

```python
def data_handler(tokens):
    sw   = int(tokens[0])
	x    = int(tokens[1])
	y    = int(tokens[2])
	sens = int(tokens[3]) # Potentioemeter
```

Let's focus on the sensitivity since it's the easiest one:

```python
sens = math.floor(sens / 100) + 1
print("Sensitivity: ", sens)
```

The value ranges from 0 to 1024, that's a huge value, so I decided to map it down to 1 to 11, so the mouse won't speed too much.

Let's do the movement now:

```python
MIDDLE_JOYSTICK = 505

x = ((x - MIDDLE_JOYSTICK) / MIDDLE_JOYSTICK) * sens
y = ((y - MIDDLE_JOYSTICK) / MIDDLE_JOYSTICK) * sens

mouse.move(x, y, False)
```

If we will not touch the joystick and let it be in the middle, the coordinates will be (505, 505), we need to map it to -505 to 505, rather than 0 to 1024.
After we mapped the values, we need to normalize it to be between -1 - 1, we can do that simply by diving 505.
Now the value is too slow, let's multiply it by the sensitivity, and we're good!

Lastly, we just need to make the Joystick Switch:

```python
if sw == 1:
    mouse.click()
    print("Clicked!")
```

If you will run this code, you will see that it will print "Clicked!" multiple times, that is because the data transferring is too fast, and is being sent multiple times during our click, we need to find a way to pause it after the first click.
Easily enough, we can do that by remembering the last click, and wait for it until its up:

```python
global last_click

if sw == 1 and last_click == 0:
    mouse.click()
    
last_click = sw
```

And that's it!



You can view the full code [Here](https://github.com/therealcain/JoystickMouseArduino).

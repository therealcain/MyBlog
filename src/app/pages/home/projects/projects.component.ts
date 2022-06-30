import {AfterViewInit, Component, ElementRef, ViewChild} from "@angular/core";
import {PageEvent} from "@angular/material/paginator";
import {LineP5} from "./p5/line";

@Component({
  selector: 'projects',
  templateUrl: 'projects.html',
  styleUrls: ['projects.scss']
})
export class ProjectsComponent {
  readonly MyProjects = [
    {
      title: 'Chip8 Interpreter',
      description: `
        Chip-8 is an interpreted programming language designed for the COSMAC VIP and Telmac 18000 microcomputers in the mid-1970s.
        These microcomputers aimed specifically at video games, and Chip-8 provided a nice easier language to make games for them.
        Every program that was written for the Chip-8 was running on a Chip-8 Virtual Machine.`,
      language: 'C++17',
      url: 'https://github.com/therealcain/Chip8-Interpreter'
    },
    {
      title: 'MOS 6502 Emulator',
      description: `
        The MOS 6502 launched in 1975 and was developed by co-workers of Motorola, they designed a CPU similar to the Motorola 6800 in HALF THE PRICE! Its success was because it was so cheap in comparison to other CPUs at that time.
        A lot of consoles and computers were running this CPU among Nintendo Entertainment System, Commodore 64, Atari 2600, and even the Apple 2.`,
      language: 'C++17',
      url: 'https://github.com/therealcain/MOS6502'
    },
    {
      title: 'Safe Endian Union',
      description: `
      A single header that is similar to C union but with endianness safety.
      It utilizes meta-programming and implements many compile-time functions to get the best results possible.`,
      language: 'C++20',
      url: 'https://github.com/therealcain/SafeEndianUnion'
    },
    {
      title: '2D Graphics Library',
      description: `A simple 2D Graphics Library is written in X11/Windows API\'s and Legacy OpenGL.\n
        'It\'s not so efficient, but it\'s easy to use.`,
      language: 'C++',
      url: 'https://github.com/therealcain/2D-Graphics-Library'
    },
    {
      title: 'Joystick Mouse',
      description: 'Allowing you to control your mouse with a joystick by using Arduino Uno. Also the potentiometer is used as a mouse sensitivity.',
      language: 'C++ and Python',
      url: 'https://github.com/therealcain/JoystickMouseArduino'
    },
    {
      title: 'ELF Reader',
      description: 'A single file to read all of the properties of an ELF.',
      language: 'C++',
      url: 'https://github.com/therealcain/elf-reader'
    },
    {
      title: 'C Memory Leaks Finder',
      description: `C++ have smart pointers and they should be used almost always, but C doesn't have that, so it's easy to forget about dynamic memory allocations, so this library simply finds memory leaks that were allocated with malloc/calloc/realloc and tell you information about that allocation. If you lazy to to download and install valgrind for some reason, this may be a nice code alternative to finding leaks.`,
      language: 'Ansi C',
      url: 'https://github.com/therealcain/CMemoryLeaksFinder'
    },
    {
      title: 'Super Mario',
      description: 'Recreation of Super Mario mechanics in a Entity-Component-System architectural pattern.',
      language: 'C++17',
      url: 'https://github.com/therealcain/SuperMario'
    }
  ];

  openLink(url: string) {
    window.open(url);
  }

  readonly PageSize: number = 3;
  lowValue = 0;
  highValue = this.PageSize;
  public getPaginatorData(event: PageEvent): PageEvent {
    this.lowValue = event.pageIndex * event.pageSize;
    this.highValue = this.lowValue + event.pageSize;
    return event;
  }
}

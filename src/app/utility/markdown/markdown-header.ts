/* Header looks like: (start page)
  title: "Meet my setup!"
  date: 30/06/2022
  tags: setup, pc
  --EOH--
* */

export class MarkdownHeader {
  private readonly Header = "--EOH--";

  path: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;

  static Parse(text: string) {
    let m = new MarkdownHeader();

    // Find header
    let headerFound = text.lastIndexOf(m.Header);
    let header = text.substring(0, headerFound);

    // Find all settings in header
    let titleFound = header.lastIndexOf("title");
    let dateFound = header.lastIndexOf("date");
    let tagsFound = header.lastIndexOf("tags");

    // Get all settings
    m.title = header.substring(titleFound + "title: ".length, dateFound)
      .replace(/\n/g, '')
      .slice(1, -1);

    m.date = header.substring(dateFound + "date: ".length, tagsFound)
      .replace(/\n/g, '');

    m.tags = header.substring(tagsFound + "tags: ".length)
      .split(",");
    m.tags[m.tags.length - 1] = m.tags[m.tags.length - 1]
      .replace(/\n/g, '');

    // Update the actual text
    m.summary = text.slice(headerFound + m.Header.length, 500);
    m.content = text.slice(headerFound + m.Header.length);

    // console.log(m);

    return m;
  }

}

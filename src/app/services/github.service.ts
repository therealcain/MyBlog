import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {MarkdownHeader} from "../utility/markdown/markdown-header";

@Injectable({
  providedIn: 'root'
})
export class GithubAPI {
  async listGithubDirectories(user: any, repo: any, branch: any, directory: any) {
    const url = `https://api.github.com/repos/${user}/${repo}/git/trees/${branch}`;
    directory = directory.split('/').filter(Boolean);

    const dir = await directory.reduce(async (acc: any, dir: any) => {
      const url = await acc;
      const list = await fetch(url).then(res => res.json());
      return list.tree.find((node: any) => node.path === dir);
    }, url);

    if (dir) {
      const list = await fetch(dir.url).then(res => res.json());
      return list.tree.map((node: any) => node.path);
    }
  }

  async getMarkdowns(user: any, repo: any, branch: any, directory: any) {
    return this.listGithubDirectories(user, repo, branch, directory).then((values: string[]) => {
        return values.filter(word => word.endsWith(".md"));
      }
    ).catch((reason) => {
      console.log(reason);
      return [];
    })
  }

  getMarkdownPagePath(user: any, repo: any, branch: any, directory: any, markdownName: any) {
    return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${directory}/${markdownName}`;
  }
}

@Injectable({
  providedIn: "root"
})
export class MarkdownFetcher {
  private readonly GithubProperties: [string, string, string, string] = ["therealcain", "MyBlog", "master", "articles"];

  markdownsHeaders$ = new BehaviorSubject<MarkdownHeader[]>([]);

  constructor(private github: GithubAPI, private http: HttpClient) {
    github.getMarkdowns(...this.GithubProperties).then(
      (array) => array.forEach(
        (value) => {
          const Path = github.getMarkdownPagePath(...this.GithubProperties, value);
          this.http.get(Path, { responseType: 'text' }).subscribe((content) => {
            let md = MarkdownHeader.Parse(content);
            md.path = Path;
            this.markdownsHeaders$.next([...this.markdownsHeaders$.getValue(), md]);
          });
        }
      )
    );
  }
}

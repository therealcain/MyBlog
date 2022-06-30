import {NgModule, SecurityContext} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from "./home/home.component";
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {TopHeaderComponent} from "./home/top-header/top-header.component";
import {SocialMediaFooterComponent} from "./home/social-media-footer/social-media-footer.component";
import {DirectivesModule} from "../directives/directives.module";
import {AboutComponent} from "./home/about/about.component";
import {SkillsComponent} from "./home/skills/skills.component";
import {ExperienceComponent} from "./home/experience/experience.component";
import {ArticlesComponent} from "./home/articles/articles.component";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {MatChipsModule} from "@angular/material/chips";
import {RouterModule} from "@angular/router";
import {ArticlesPageComponent} from "./articles/articles.component";
import {UtilityModule} from "../utility/utility.module";
import {MarkdownModule} from "ngx-markdown";
import {HttpClient} from "@angular/common/http";
import {ProjectsComponent} from "./home/projects/projects.component";
import {MatTabsModule} from "@angular/material/tabs";
import {MatExpansionModule} from "@angular/material/expansion";

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    DirectivesModule,
    MatPaginatorModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    RouterModule,
    UtilityModule,
    MarkdownModule.forRoot({
      loader: HttpClient,
      sanitize: SecurityContext.NONE
    }),
    MatTabsModule,
    MatExpansionModule
  ],
  declarations: [
    HomeComponent,
    TopHeaderComponent,
    SocialMediaFooterComponent,
    AboutComponent,
    SkillsComponent,
    ExperienceComponent,
    ArticlesComponent,
    ArticlesPageComponent,
    ProjectsComponent
  ],
  exports: [
    HomeComponent,
    ArticlesPageComponent
  ]
})
export class PagesModule {
}

import { PageBackground } from "@/types/page";
import { PageLayout } from "./PageLayout";

export class PageData {
  public title = "";

  public background: PageBackground = {};

  public children: Array<PageLayout> = [];

  public footer = '';
}

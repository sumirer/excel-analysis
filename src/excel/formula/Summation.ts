import { IBaseData } from "@/types";
import { Formula } from "./Formula";

export class Summation extends Formula<IBaseData> {
  receive(data: IBaseData): IBaseData {
    return data;
  }
}

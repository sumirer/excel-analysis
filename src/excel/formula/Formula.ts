import { IBaseData } from "@/types";

export abstract class Formula<O> {

    abstract receive(data: IBaseData): O;
}
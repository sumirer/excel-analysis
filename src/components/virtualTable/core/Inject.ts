import { InjectionKey } from 'vue';

export const SIZE_PROVIDED_KEY: InjectionKey<string> = Symbol('size_provider_key');

export const EVENT_PROVIDE_KEY: InjectionKey<string> = Symbol('event_provider_key');

export const TABLE_DATA_PROVIDER_KEY: InjectionKey<string> = Symbol('table_data_provider_key');

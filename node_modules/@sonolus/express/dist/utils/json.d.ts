import { Static, TSchema } from '@sinclair/typebox';
export declare const parse: <T extends TSchema>(json: Buffer | string, schema: T) => Static<T> | undefined;

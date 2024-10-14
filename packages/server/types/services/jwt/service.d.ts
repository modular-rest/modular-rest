export const name: "jwt";
export const main: JWT;
declare class JWT {
    setKies(privateKey: any, publicKey: any): void;
    privateKey: any;
    publicKey: any;
    sign(payload: any): Promise<any>;
    verify(token: any): Promise<any>;
}
export {};

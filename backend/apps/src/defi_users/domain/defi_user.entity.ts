export class DefiUser {
    constructor(
        public id: string,
        public wallet_address: string,
        public wallet_type: string,
        public created_at: Date,
    ) { }
}
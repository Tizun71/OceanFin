export class User {
  constructor(
    public readonly id: string,
    public walletAddress: string,
    public chainId: number,
    public username?: string,
  ) {}

  changeUsername(newName: string) {
    if (!newName) {
      throw new Error('Username cannot be empty');
    }
    this.username = newName;
  }
}

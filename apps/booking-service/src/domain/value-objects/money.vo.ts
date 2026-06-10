export class Money {
    constructor(
        readonly amount: number,
        readonly currency: string,
    ) {
        if (amount < 0) {
            throw new Error("Amount cannot be negative");
        }
    }

    add(other: Money): Money {
        if (this.currency !== other.currency) {
            throw new Error("Currency mismatch");
        }

        return new Money(this.amount + other.amount, this.currency);
    }
}

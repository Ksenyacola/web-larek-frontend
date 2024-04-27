import { Form } from './common/form';
import { IActions, IOrderForm } from '../types';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/events';

export class Order extends Form<IOrderForm> {
    protected _cardButton: HTMLButtonElement;
    protected _cashButton: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents, actions?: IActions) {
        super(container, events);

        this._cardButton = ensureElement<HTMLButtonElement>(
            'button[name="card"]',
            this.container
        );
        this._cashButton = ensureElement<HTMLButtonElement>(
            'button[name="cash"]',
            this.container
        );
        this._cardButton.classList.add('button_alt-active');

        this._cardButton.addEventListener('click', () => this.selectPaymentMethod('card'));
        this._cashButton.addEventListener('click', () => this.selectPaymentMethod('cash'));
    }

    selectPaymentMethod(paymentMethod: string) {
        if (paymentMethod === 'card') {
            this._cardButton.classList.add('button_alt-active');
            this._cashButton.classList.remove('button_alt-active');
        } else if (paymentMethod === 'cash') {
            this._cashButton.classList.add('button_alt-active');
            this._cardButton.classList.remove('button_alt-active');
        }
    }

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
import {
    FormErrorsContacts,
    FormErrorsOrder,
    IContactsForm,
    IOrder,
    IOrderForm,
    IProductItem,
} from '../types';
import { Model } from './base/model';
import {IEvents} from './base/events'

export type CatalogChangeEvent = {
    catalog: IProductItem[];
};

export type ProductStatus = 'basket' | 'sell';

export class AppState extends Model<AppState> {
    basketList: IProductItem[] = [];
    catalog: IProductItem[];
    order: IOrder = {
        address: '',
        items: [],
        payment: 'online',
        email: '',
        phone: '',
        total: 0,
    };
	events: IEvents;

    selectPaymentMethod(paymentMethod: string) {
        if (paymentMethod === 'cash' || paymentMethod === 'online') {
            this.order.payment = paymentMethod;
        } else {
            console.error('Unknown payment method:', paymentMethod);
        }
    }

    setOrderItems(items: string[]) {
        this.order.items = items;
    }

    formErrorsOrder: FormErrorsOrder = {};
    formErrorsContacts: FormErrorsContacts = {};

    clearBasket() {
        this.basketList.forEach((item) => {
            item.status = 'sell';
        });
        this.basketList = [];
    }

    getTotal() {
        return this.basketList.reduce((a, c) => a + c.price, 0);
    }

    setCatalog(items: IProductItem[]) {
        this.catalog = items;
        this.emitChanges('catalog:install', { catalog: this.catalog });
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateOrder() {
        const errors: typeof this.formErrorsOrder = {};

        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrorsOrder = errors;
        this.events.emit('formErrorsOrder:change', this.formErrorsOrder);

        return Object.keys(errors).length === 0;
    }

    setContactsField(field: keyof IContactsForm, value: string) {
        this.order[field] = value;
        if (this.validateContacts()) {
            this.events.emit('contacts:ready', this.order);
        }
    }

    validateContacts() {
        const errors: typeof this.formErrorsContacts = {};

        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrorsContacts = errors;
        this.events.emit('formErrorsContacts:change', this.formErrorsContacts);

        return Object.keys(errors).length === 0;
    }

    addToCart(item: IProductItem) {
    if (item.status === 'sell' && item.price !== null) {
        item.status = 'basket';
        this.basketList.push(item);
        this.emitChanges('basket:changed', this.basketList);
    } else if (item.status === 'basket') {
        item.status = 'sell';
        this.basketList = this.basketList.filter(it => it !== item);
        this.emitChanges('basket:changed', this.basketList);
    }
}


    getCartItems(): IProductItem[] {
        return this.basketList;
    }
}
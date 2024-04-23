import {
	FormErrorsContacts,
	FormErrorsOrder,
	IContactsForm,
	IOrder,
	IOrderForm,
	IProductItem,
} from '../types';
import { Model } from './base/model';

export type CatalogChangeEvent = {
	catalog: ProductItem[];
};

export type ProductStatus = 'basket' | 'sell';

export class ProductItem extends Model<IProductItem> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	status: ProductStatus = 'sell';
	itemCount: number;
}

export class AppState extends ProductItem {
	basketList: ProductItem[] = [];
	catalog: ProductItem[];
	order: IOrder = {
		address: '',
		items: [],
		payment: 'online',
		email: '',
		phone: '',
		total: 0,
	};

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
		this.catalog = items.map((item) => new ProductItem(item, this.events));
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

	addToCart(item: ProductItem) {
		if (item.status === 'sell' && item.price !== null) {
			this.basketList.push(item);
			item.status = 'basket';
			item.itemCount = this.basketList.length;
			this.emitChanges('basket:changed', this.basketList);
		} else if (item.status === 'basket') {
			this.basketList = this.basketList.filter((it) => it !== item);
			item.status = 'sell';
			item.itemCount = this.basketList.length;
			this.emitChanges('basket:changed', this.basketList);
		}
	}

	getCartItems(): ProductItem[] {
		return this.basketList;
	}
}
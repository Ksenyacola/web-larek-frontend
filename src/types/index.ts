import { ProductStatus } from "../components/appData";

export interface IPage {
	catalog: HTMLElement[];
	locked: boolean;
}


export interface IProductItem {
    id: string;
    description: string;
    image: string;
    title: string;
	status?: ProductStatus;
    category: string;
    price: number | null;
    itemCount: number;
}

export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard extends IProductItem {
    buttonText: string;
    itemCount: number;
}

export interface IModalData {
	content: HTMLElement;
}

export interface IBasketView {
	items: HTMLElement[];
	total: number | string;
	selected: string[];
}

export interface IFormState {
	valid: boolean;
	errors: string[];
}

export interface IOrderForm {
	payment: string;
	address: string;
}

export interface IContactsForm {
	email: string;
	phone: string;
}

export interface IOrder extends IOrderForm, IContactsForm {
	total: number | string;
	items: string[];
}

export interface IContacts extends IContactsForm {
	items: string[];
}

export interface IActions {
	onClick: (event: MouseEvent) => void;
}

export interface ISuccessActions {
	onClick: () => void;
}

export interface ISuccess {
	id: string;
	total: number;
}

export type FormErrorsOrder = Partial<Record<keyof IOrder, string>>;
export type FormErrorsContacts = Partial<Record<keyof IContacts, string>>;
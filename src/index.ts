import './scss/styles.scss';

import { Page } from './components/psge';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { AppState, ProductItem } from './components/appData';
import { Card } from './components/card';
import { WebLarekAPI } from './components/webLarekApi';
import { API_URL, CDN_URL, PaymentMethodTypeToLabel } from './utils/constants';
import { IContactsForm, IOrder, IOrderForm } from './types';
import { Modal } from './components/common/modal';
import { Basket } from './components/common/basket';
import { Order } from './components/order';
import { Contacts } from './components/contact';
import { Success } from './components/common/success';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

const productCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const productPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cartTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cartItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const customerInfoTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const checkoutTemplate = ensureElement<HTMLTemplateElement>('#order');
const orderSuccessTemplate = ensureElement<HTMLTemplateElement>('#success');

const appData = new AppState({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(cartTemplate), events);
const order = new Order(cloneTemplate(checkoutTemplate), events, {
	onClick: (evt: Event) => events.emit('payment:toggle', evt.target),
});
const contacts = new Contacts(cloneTemplate(customerInfoTemplate), events);

events.on('catalog:install', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card(cloneTemplate(productCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
		});
	});
});

events.on('card:select', (item: ProductItem) => {
	const card = new Card(cloneTemplate(productPreviewTemplate), {
		onClick: () => {
			events.emit('item:toggle', item);
			page.counter = appData.getCartItems().length;
			card.buttonText = item.status;
		},
	});
	return modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
			buttonText: item.status,
		}),
	});
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

events.on('basket:open', () => {
	basket.items = appData.getCartItems().map((item, index) => {
		const card = new Card(cloneTemplate(cartItemTemplate), {
			onClick: () => {
				events.emit('item:toggle', item);
			},
		});
		card.index = (index + 1).toString();
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	page.counter = appData.getCartItems().length;
	basket.selected = appData.getCartItems();
	basket.total = appData.getTotal();
	appData.order.total = appData.getTotal();
	return modal.render({
		content: basket.render(),
	});
});

events.on('item:toggle', (item: ProductItem) => {
	appData.addToCart(item);

	page.counter = appData.getCartItems().length;
});

events.on('basket:changed', (items: ProductItem[]) => {
	basket.items = items.map((item, index) => {
		const card = new Card(cloneTemplate(cartItemTemplate), {
			onClick: () => {
				events.emit('item:toggle', item);
			},
		});
		card.index = (index + 1).toString();
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	appData.order.total = appData.getTotal();
	basket.total = appData.getTotal();
});

events.on('order:open', () => {
	modal.render({
		content: order.render({
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('payment:toggle', (name: HTMLElement) => {
	if (!name.classList.contains('button_alt-active')) {
		order.selectPaymentMethod(name);
		appData.order.payment = PaymentMethodTypeToLabel[name.getAttribute('name')];
	}
});

events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

events.on('formErrorsOrder:change', (errors: Partial<IOrder>) => {
	const { address } = errors;
	order.valid = !address;
	order.errors = Object.values({ address }).filter(Boolean).join('; ');
});

events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
	appData.order.items = appData.basketList.map((item) => item.id);
});

events.on(
	/^contacts\.[^:]*:change/,
	(data: { field: keyof IContactsForm; value: string }) => {
		appData.setContactsField(data.field, data.value);
	}
);

events.on('formErrorsContacts:change', (errors: Partial<IOrder>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ email, phone }).filter(Boolean).join('; ');
});

events.on('contacts:submit', () => {
	api
		.orderResult(appData.order)
		.then((result) => {
			appData.clearBasket();
			page.counter = appData.getCartItems().length;
			const success = new Success(cloneTemplate(orderSuccessTemplate), {
				onClick: () => {
					modal.close();
				},
			});
			success.total = result.total;

			modal.render({
				content: success.render({}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

api
  .getProductList()
  .then((data) => {
    appData.setCatalog(data);
  })
  .catch((err) => {
    console.error(err);
  });

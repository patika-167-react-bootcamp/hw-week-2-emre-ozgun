const globalState = {
	accountState: [],
	historyState: [],
	transactionState: [],
	productState: [],
	cartState: [],
};

//local account state
let accountInfo = {
	name: '',
	balance: 0,
	id: '',
};

//local transaction state
let transactionInfo = {
	from: { id: '', name: '' },
	to: { id: '', name: '' },
	amount: 0,
	transactionId: '',
	status: '',
};

//local history state (account creation and deletion)
let transactionHistory = '';

// load dom elements and event listeners
let accountList,
	accountForm,
	addAccountBtn,
	transactionForm,
	transactionHistoryList,
	addTransactionBtn,
	transactionAmount,
	transactionResults,
	resultFrom,
	resultTo,
	searchAccount,
	searchResults,
	openTransactionFilterBtn,
	closeTransactionFilterBtn,
	filterTransactionForm,
	transactionFilterOverlay,
	transactionFilterSearchInput,
	filteredTransactionsContainer,
	filteredTransactionCounter,
	productForm,
	addProductBtn,
	productList,
	cartList,
	cartTotal,
	openPayerList,
	closePayerList,
	placeOrderBtn,
	payerList,
	payerListUl;

window.addEventListener('DOMContentLoaded', () => {
	//*account list*

	accountList = document.querySelector('.account-list');
	accountForm = document.querySelector('.add-user');
	addAccountBtn = document.querySelector('.add-user').querySelector('button');

	accountForm.firstElementChild.focus();

	accountForm.addEventListener('submit', handleAccountSubmit);
	accountForm.addEventListener('keyup', handleAccountChange);

	//*transactions*
	transactionHistoryList = document.querySelector('.transaction-list');
	transactionForm = document.querySelector('.add-transaction');
	addTransactionBtn = document.querySelector('#transaction-submit');
	transactionAmount = document.querySelector('#transaction-amount');
	transactionResults = document.querySelector('#transaction-results');
	resultFrom = document.querySelector('#result-from');
	resultTo = document.querySelector('#result-to');

	transactionForm.addEventListener('click', locateTransactionEvent);
	transactionAmount.addEventListener('keyup', handleTransactionAmount);

	// from-to selection
	searchAccount = document.querySelector('.search-account');
	searchResults = document.querySelector('.search-results');
	searchResults.addEventListener('click', makeSelection);

	// REVISION - I
	transactionHistoryList.addEventListener('click', handleRevokeTransaction);
	accountList.addEventListener('click', handleRemoveAccount);

	// REVISION - II

	openTransactionFilterBtn = document.querySelector('#open-transaction-btn');
	closeTransactionFilterBtn = document.querySelector('#close-transaction-btn');
	filterTransactionForm = document.querySelector('.filter-transaction-form');
	transactionFilterOverlay = document.querySelector(
		'#transaction-filter-overlay'
	);
	transactionFilterSearchInput = document.querySelector(
		'#filter-transaction-input'
	);
	filteredTransactionsContainer = document.querySelector(
		'#filter-transaction-results'
	);
	filteredTransactionCounter = document.querySelector('#f-count');

	openTransactionFilterBtn.addEventListener('click', openTransactionFilterForm);
	closeTransactionFilterBtn.addEventListener(
		'click',
		closeTransactionFilterForm
	);
	filterTransactionForm.addEventListener('click', handleTransactionFilter);
	transactionFilterSearchInput.addEventListener(
		'keyup',
		handleTransactionSearchInput
	);

	// REVISION - III

	productForm = document.querySelector('#product-form');
	addProductBtn = document.querySelector('#add-product-btn');
	productList = document.querySelector('#product-list');
	cartList = document.querySelector('#cart-list');
	cartTotal = document.querySelector('#cart-total');
	openPayerList = document.querySelector('#select-user-cart');
	placeOrderBtn = document.querySelector('#place-order');
	payerList = document.querySelector('#payer-list');
	closePayerList = document.querySelector('#close-payer-list');
	payerListUl = document.querySelector('.payer-list-ul');

	productForm.addEventListener('keyup', handleProductChange);
	addProductBtn.addEventListener('click', handleProductSubmit);
	productList.addEventListener('click', handleAddToCart);
	cartList.addEventListener('click', handleRemoveFromCart);

	openPayerList.addEventListener(
		'click',
		() => (payerList.classList = 'active')
	);
	closePayerList.addEventListener('click', () => (payerList.classList = ''));

	payerList.addEventListener('click', handleSelectPayer);
	placeOrderBtn.addEventListener('click', handlePaymentSubmit);
});

// dispatch func.
const setState = (type, payload) => {
	if (type === 'ADD_ACCOUNT') {
		globalState.accountState = [...globalState.accountState, payload];

		updateHistory(payload, 'account-creation');
		triggerPayerListRender();
	}

	if (type === 'REMOVE_ACCOUNT') {
		const accountToBeRemoved = globalState.accountState.find(
			(acc) => acc.id === payload
		);

		globalState.accountState = globalState.accountState.filter(
			(acc) => acc.id !== payload
		);

		updateHistory(accountToBeRemoved, 'account-deletion');
		triggerPayerListRender();
	}

	if (type === 'ADD_TRANSACTION') {
		updateBalance(payload, 'add');
		updateHistory(payload, 'add');
	}

	//REVISION - II

	if (type === 'REVOKE_TRANSACTION') {
		updateBalance(payload, 'revoke');
		updateHistory(payload, 'revoke');
	}

	// REVISION - IIII

	if (type === 'ADD_PRODUCT') {
		globalState.productState = [...globalState.productState, payload];
		triggerProductListRender();
	}

	if (type === 'ADD_TO_CART') {
		const isItemAlreadyInCart = globalState.cartState.find(
			(c) => c.productId === payload.productId
		);

		const maxQuantity = globalState.productState.find(
			(p) => p.productId === payload.productId
		).productStockAmount;

		if (isItemAlreadyInCart) {
			globalState.cartState = globalState.cartState.map((cart) => {
				if (cart.productId === payload.productId) {
					return {
						...cart,
						quantity:
							cart.quantity + 1 > maxQuantity ? maxQuantity : cart.quantity + 1,
					};
				} else {
					return cart;
				}
			});
		} else {
			globalState.cartState = [...globalState.cartState, payload];
		}

		triggerCartListRender();
		checkIsPayable();
	}

	if (type === 'PLACE_ORDER') {
		console.log({ paymentState });

		const uId = payload.payerId;
		const orderTotal = payload.total;

		const user = globalState.accountState.find((u) => u.id === uId);

		if (user.balance < orderTotal) {
			alert('Insufficient funds.');
			return;
		}

		//update user balance after purchase
		globalState.accountState = globalState.accountState.map((acc) => {
			if (acc.id === uId) {
				return {
					...acc,
					balance: acc.balance - orderTotal,
				};
			} else {
				return acc;
			}
		});

		//update quantities after purchase
		globalState.productState = globalState.productState.map((p) => {
			const wasProductInCart = globalState.cartState.find(
				(c) => c.productId === p.productId
			);
			if (wasProductInCart) {
				return {
					...p,
					productStockAmount: p.productStockAmount - wasProductInCart.quantity,
				};
			} else {
				return p;
			}
		});
		//empty cart and gtfo
		globalState.cartState = [];
		triggerCartListRender();
		triggerProductListRender();
		triggerPayerListRender();
		updateHistory({ name: user.name, total: orderTotal }, 'order-complete');
	}

	//TRIGGER RERENDERS AFTER STATE UPDATES... (vanilla js vs react)
	triggerAccountRender();
	triggerFromToSearchRender();
	triggerHistoryRender();
};

// account balance state updater.
const updateBalance = (transactionInfo, identifier) => {
	if (identifier === 'add') {
		globalState.accountState = globalState.accountState.map((account) => {
			if (account.id === transactionInfo.from.id) {
				return {
					...account,
					balance: account.balance - transactionInfo.amount,
				};
			}
			if (account.id === transactionInfo.to.id) {
				return {
					...account,
					balance: account.balance + transactionInfo.amount,
				};
			}
			return account;
		});
	} else if (identifier === 'revoke') {
		const transactionToBeRevoked = globalState.transactionState.find(
			(t) => t.transactionId === transactionInfo
		);

		const revokeFrom = transactionToBeRevoked.from.id;
		const revokeTo = transactionToBeRevoked.to.id;
		const amountToBeRevoked = transactionToBeRevoked.amount;

		globalState.accountState = globalState.accountState.map((acc) => {
			if (acc.id === revokeFrom) {
				return {
					...acc,
					balance: acc.balance + amountToBeRevoked,
				};
			} else if (acc.id === revokeTo) {
				return {
					...acc,
					balance: acc.balance - amountToBeRevoked,
				};
			} else {
				return acc;
			}
		});

		return;
	} else {
		return;
	}
};

// history state updater.
const updateHistory = (transactionInfo, identifier) => {
	if (identifier === 'add') {
		// add to transaction state, id of this is prominent (for filtering transactions)
		globalState.transactionState = [
			...globalState.transactionState,
			transactionInfo,
		];
		globalState.historyState = [...globalState.historyState, transactionInfo];
	} else if (identifier === 'account-creation') {
		transactionHistory = `${formatName(
			transactionInfo.name
		)} created an account with the initial balance of ${formatPrice(
			transactionInfo.balance
		)}.`;
		globalState.historyState = [
			...globalState.historyState,
			transactionHistory,
		];
	} else if (identifier === 'account-deletion') {
		transactionHistory = `${formatName(
			transactionInfo.name
		)} deleted their account.`;

		globalState.historyState = [
			...globalState.historyState,
			transactionHistory,
		];
	} else if (identifier === 'revoke') {
		const transactionRevoked = globalState.transactionState.find(
			(t) => t.transactionId === transactionInfo
		);

		globalState.transactionState = globalState.transactionState.map((t) => {
			if (t.transactionId === transactionRevoked.transactionId) {
				return { ...t, status: 'revoked' };
			} else {
				return t;
			}
		});
	} else if (identifier === 'order-complete') {
		transactionHistory = `${formatName(
			transactionInfo.name
		)} placed an order [${formatPrice(transactionInfo.total)}]`;
		globalState.historyState = [
			...globalState.historyState,
			transactionHistory,
		];
	}
	transactionHistory = '';
};

//responsible for rendering account list.
const triggerAccountRender = () => {
	accountList.innerHTML = '';

	const generateAccountDOM = (id, name, balance) => {
		const li = document.createElement('li');
		li.dataset.id = id;
		li.innerHTML = `
		
    <span id="acc-name"><span id="remove-account-btn">X</span>${formatName(
			name
		)} </span>
    <span class="acc-balance">${formatPrice(balance)}</span>
    `;

		return li;
	};

	if (globalState.accountState.length < 1) {
		accountList.innerHTML = `<li>No active accounts...</li>`;
		return;
	}

	globalState.accountState.forEach(({ id, name, balance }) =>
		accountList.append(generateAccountDOM(id, name, balance))
	);
};

//responsible for rendering transaction history list.
const triggerHistoryRender = () => {
	transactionHistoryList.innerHTML = '';

	//if string, render basic li. if transaction object render complex li (dataset.id,  dataset.from, dataset.to)

	//revoked
	const revokedIds = globalState.transactionState
		.filter((t) => t.status === 'revoked')
		.map((t) => t.transactionId);

	globalState.historyState.forEach((history) => {
		let historyLi = document.createElement('li');
		historyLi.classList.add('transaction-list-item');

		let flag = '';
		if (revokedIds.includes(history.transactionId)) {
			historyLi.classList.add('removed-transaction');
			flag = 'disable';
		}

		if (typeof history === 'string') {
			historyLi.innerText = history;
		} else {
			historyLi.dataset.id = history.transactionId;
			historyLi.dataset.from = history.from.name;
			historyLi.dataset.to = history.to.name;

			historyLi.innerHTML = `
			${!flag ? "<button id='remove-transaction-btn'>revoke</button>" : ''}
			<span>${formatName(history.from.name)} sent ${formatPrice(
				history.amount
			)} to ${formatName(history.to.name)}.</span>
			`;
		}

		transactionHistoryList.prepend(historyLi);
	});
};

// account handlers, employs basic validation
const handleAccountSubmit = (e) => {
	e.preventDefault();
	accountInfo.id = generateId();

	const isUser = (function () {
		return globalState.accountState.find(
			(acc) => acc.name === accountInfo.name
		);
	})();

	if (isUser) {
		alert(`Account with the name(email) ${accountInfo.name} already exists`);
	} else {
		setState('ADD_ACCOUNT', accountInfo);
	}

	accountInfo = {};
	addAccountBtn.disabled = true;
	Array.from(e.target.children).forEach((input) => (input.value = ''));
};

const handleAccountChange = (e) => {
	e.preventDefault();

	if (e.target.name === 'account-name') {
		accountInfo.name = e.target.value;
	} else {
		if (
			+e.target.value < 0 ||
			e.target.value.startsWith('-') ||
			e.target.value.startsWith('00')
		) {
			e.target.value = '';
			return;
		}
		accountInfo.balance = +e.target.value;
		if (!accountInfo.balance) {
			e.target.value = '';
			return;
		}
	}

	if (accountInfo.name.length > 5 && accountInfo.balance > 0) {
		addAccountBtn.disabled = false;
	} else {
		addAccountBtn.disabled = true;
	}
};

// TRANSACTIONS
const clearTransactionForm = () => {
	transactionInfo = {
		from: { id: '', name: '' },
		to: { id: '', name: '' },
		amount: 0,
		transactionId: '',
		status: '',
	};
	addTransactionBtn.disabled = true;
	transactionAmount.style.display = 'none';
	transactionAmount.value = '';
	transactionResults.style.display = 'none';
	updateTransactionInfo();
	shouldAmountBeDisplayed();
};

const handleTransactionSubmit = () => {
	const transactionId = generateId();
	const t = { ...transactionInfo, transactionId };

	setState('ADD_TRANSACTION', t);
	triggerFilteredTransactionsRender();
	clearTransactionForm();
};

const updateTransactionInfo = () => {
	resultFrom.innerText = transactionInfo.from.name;
	resultTo.innerText = transactionInfo.to.name;
	transactionForm.querySelector('.search-account').style.display = 'none';
	document.querySelector('.search-results').classList = 'search-results';
};

const shouldAmountBeDisplayed = () => {
	if (transactionInfo.from.name && transactionInfo.to.name) {
		const maxAmount = globalState.accountState.find(
			(user) => user.id === transactionInfo.from.id
		).balance;
		transactionAmount.style.display = 'block';
		transactionAmount.placeholder = `Amount [Balance: ${formatPrice(
			maxAmount
		)}]`;
	} else {
		transactionAmount.style.display = 'none';
	}
};

const makeSelection = (e) => {
	if (e.currentTarget.classList.contains('from')) {
		if (e.target.dataset.id) {
			transactionInfo.from = {
				id: e.target.dataset.id,
				name: e.target.textContent,
			};
		}
	}
	if (e.currentTarget.classList.contains('to')) {
		if (e.target.dataset.id) {
			transactionInfo.to = {
				id: e.target.dataset.id,
				name: e.target.textContent,
			};
		}
	}

	if (transactionInfo.from.name || transactionInfo.to.name) {
		document.querySelector('#transaction-results').style.display = 'flex';
	}

	updateTransactionInfo();
	shouldAmountBeDisplayed();
};

const fetchSearchResults = () => {
	let li = '';
	if (globalState.accountState.length < 1) {
		li = `<li>Account list is currently empty, consider adding an account.</li>`;
	} else {
		globalState.accountState.forEach(
			({ id, name }) =>
				(li += `
			<li data-id="${id}">${formatName(name)}</li>`)
		);
	}
	return li;
};

const triggerFromToSearchRender = () => {
	searchResults.innerHTML = fetchSearchResults();
};

const displaySearchResults = (identifier) => {
	let searchIdentifier = document.querySelector('#search-input');

	if (identifier === 'from') {
		searchIdentifier.placeholder = 'SENDER: Search Account';
		searchResults.classList.add('from');
	} else {
		searchIdentifier.placeholder = 'RECEIVER: Search Account';
		searchResults.classList.add('to');
	}

	triggerFromToSearchRender();
	searchAccount.style.display = 'block';
};

const locateTransactionEvent = (e) => {
	if (e.target.id === 'from-btn') {
		displaySearchResults('from');
	}
	if (e.target.id === 'to-btn') {
		displaySearchResults('to');
	}
	if (e.target.id === 'close-search') {
		searchAccount.style.display = 'none';
		searchResults.classList = 'search-results';
	}
	if (e.target.id === 'transaction-submit') {
		e.preventDefault();
		handleTransactionSubmit();
	}
	return;
};

const handleTransactionAmount = (e) => {
	const maxBalance = globalState.accountState.find(
		(user) => user.id === transactionInfo.from.id
	).balance;

	if (+e.target.value > maxBalance) {
		e.target.value = maxBalance;
	}
	if (
		+e.target.value < 0 ||
		e.target.value.startsWith('-') ||
		e.target.value.startsWith('00')
	) {
		e.target.value = '';
		return;
	}
	transactionInfo.amount = +e.target.value;

	if (transactionInfo.amount > 0 && transactionInfo.amount <= maxBalance) {
		addTransactionBtn.disabled = false;
	} else {
		addTransactionBtn.disabled = true;
	}
};

// REVISION - I - account and transaction removal

const handleRemoveAccount = (e) => {
	// make use of event delegation to remove account (li items are dynamically generated)
	if (e.target.id === 'remove-account-btn') {
		const accountToBeRemoved = e.target.parentElement.parentElement.dataset.id;
		//get user id from parent.dataset.id and filter globalState.accountState and re-render
		setState('REMOVE_ACCOUNT', accountToBeRemoved);
	} else {
		return;
	}
};

// check for deleted accounts...
const canRevokeTransaction = (transactionId) => {
	const { from, to } = globalState.transactionState.find(
		(t) => t.transactionId === transactionId
	);

	if (from.id === to.id) return true;

	const isUser = globalState.accountState.filter(
		(acc) => acc.id === from.id || acc.id === to.id
	);

	return isUser.length < 2 ? false : true;
};

const handleRevokeTransaction = (e) => {
	if (e.target.id === 'remove-transaction-btn') {
		const parent = e.target.parentElement;
		const transactionId = parent.dataset.id;

		if (!canRevokeTransaction(transactionId)) {
			alert('Cannot revoke transaction, one of the accounts could be deleted.');
			return;
		} else {
			setState('REVOKE_TRANSACTION', transactionId);
		}
	} else {
		return;
	}
};

// REVISION - II - filtering transactions

// filtering globalState.transactionState based on local transactionFilters. Doesn't make use of global state hence locally defined.
let transactionFilters = {
	type: 'all',
	searchInput: '',
};

const triggerFilteredTransactionsRender = () => {
	const searchVal = transactionFilters.searchInput;
	let filteredTransactions;
	filteredTransactionsContainer.innerHTML = ``;

	if (globalState.transactionState.length < 1) {
		filteredTransactionsContainer.innerHTML = `
		<li>Transaction history empty...</li>
		`;
		filteredTransactionCounter.innerText = '(0)';
		return;
	}

	if (searchVal) {
		filteredTransactions = globalState.transactionState.filter(
			(t) =>
				t.from.name.toLowerCase().includes(searchVal.toLowerCase()) ||
				t.to.name.toLowerCase().includes(searchVal.toLowerCase())
		);
	} else {
		filteredTransactions = globalState.transactionState;
	}

	if (transactionFilters.type === 'from') {
		filteredTransactions = filteredTransactions.filter((t) =>
			t.from.name.toLowerCase().includes(searchVal.toLowerCase())
		);
	}
	if (transactionFilters.type === 'to') {
		filteredTransactions = filteredTransactions.filter((t) =>
			t.to.name.toLowerCase().includes(searchVal.toLowerCase())
		);
	}

	if (filteredTransactions.length < 1) {
		filteredTransactionsContainer.innerHTML = `
		<li>No transaction matched your search criteria.</li>
		`;
		filteredTransactionCounter.innerText = '(0)';
		return;
	} else {
		let composite = ``;

		filteredTransactions.forEach((t) => {
			const li = `<li class="${t.status && 'revoked-history'}">${
				t.from.name
			} sent ${t.amount} to ${t.to.name}</li>`;
			composite += li;
		});
		filteredTransactionCounter.innerText = `(${filteredTransactions.length})`;
		filteredTransactionsContainer.innerHTML = composite;
	}
};

const openTransactionFilterForm = (e) => {
	filterTransactionForm.classList.add('active');
	transactionFilterOverlay.classList.add('active');
	document.querySelector('#filter-transaction-input').focus();
	triggerFilteredTransactionsRender();
};

const closeTransactionFilterForm = (e) => {
	filterTransactionForm.classList.remove('active');
	transactionFilterOverlay.classList.remove('active');
};

const handleTransactionFilter = (e) => {
	if (e.target.classList.contains('t-type')) {
		const typeBtns = document
			.querySelector('#filter-transaction-type')
			.querySelectorAll('button');
		typeBtns.forEach((btn) => {
			if (btn.id === e.target.id) {
				btn.classList.add('active');
			} else {
				btn.classList.remove('active');
			}
			transactionFilters = {
				...transactionFilters,
				type: e.target.innerText,
			};
		});
	}

	if (e.target.id === 'f-t-done') {
		closeTransactionFilterForm();
		return;
	}
	if (e.target.id === 'f-t-reset') {
		transactionFilters = {
			type: 'all',
			searchInput: '',
		};
		transactionFilterSearchInput.value = '';
		const typeBtns = document
			.querySelector('#filter-transaction-type')
			.querySelectorAll('button');
		typeBtns.forEach((btn) => {
			if (btn.id === 'filter-type-any') {
				btn.classList.add('active');
			} else {
				btn.classList.remove('active');
			}
			transactionFilters = {
				...transactionFilters,
				type: e.target.innerText,
			};
		});
		document.querySelector('#filter-transaction-input').focus();
	}

	triggerFilteredTransactionsRender();
};

const handleTransactionSearchInput = (e) => {
	e.preventDefault();
	transactionFilters.searchInput = e.target.value;
	triggerFilteredTransactionsRender();
};

// REVISION - III

//local

let productInfo = {
	productId: '',
	productName: '',
	productStockAmount: 0,
	productPrice: 0,
};

let cartItem = {
	productId: '',
	quantity: 0,
};

const triggerProductListRender = () => {
	productList.innerHTML = ``;

	if (globalState.productState.length < 1) {
		productList.innerHTML = `<li>No available products...</li>`;
	} else {
		let composite = ``;

		globalState.productState.forEach((product) => {
			li = `
			<li class='product-list-item' data-product=${product.productId}>
			<div>
			<span>(${
				product.productStockAmount > 0
					? product.productStockAmount
					: 'out of stock'
			})</span>
			<span>${formatName(product.productName)} -- </span>
			<span>${formatPrice(product.productPrice)}</span>
			
			</div>
			<div>
			<button id="add-to-cart-btn" ${
				product.productStockAmount < 1 && 'disabled'
			} type="button">add</button>
			</div>
			</li>
			`;

			composite += li;
		});
		productList.innerHTML = composite;
	}
};

const triggerPayerListRender = () => {
	payerListUl.innerHTML = '';
	if (globalState.accountState.length < 1) {
		payerListUl.innerHTML = `<li>No active users to pay...</li>`;
		openPayerList.textContent = 'SELECT USER';
		placeOrderBtn.disabled = true;
	} else {
		let composite = ``;
		globalState.accountState.forEach((account) => {
			li = `
			<li class='payer-list-item' data-account="${account.id}">
				${formatName(account.name)}
			</li>
			`;
			composite += li;
		});
		payerListUl.innerHTML = composite;
	}
};

const renderCartTotal = () => {
	let total = 0;

	globalState.cartState.forEach((c) => {
		const p = globalState.productState.find((p) => p.productPrice);
		total += p.productPrice * c.quantity;
	});
	paymentState.total = total;

	cartTotal.innerText = formatPrice(total);
};

const triggerCartListRender = () => {
	renderCartTotal();
	cartList.innerHTML = ``;

	if (globalState.cartState.length < 1) {
		cartList.innerHTML = `<li>Your cart is empty.</li>`;
	} else {
		let composite = ``;

		globalState.cartState.forEach((cart) => {
			const product = globalState.productState.find(
				(p) => p.productId === cart.productId
			);

			const subTotal = product.productPrice * cart.quantity;
			const quantity = cart.quantity;

			li = `
			<li class='cart-list-item' data-product=${cart.productId}>
			<div>
			<span>(${quantity})</span>
			<span>${formatName(product.productName)} -- </span>
			<span>Sub Total: ${formatPrice(subTotal)}}</span>
			</div>
			<div>
			<button id="remove-from-cart-btn" type="button">x</button>
			</div>
			</li>
			`;

			composite += li;
		});
		cartList.innerHTML = composite;
	}
};

const handleProductSubmit = (e) => {
	e.preventDefault();
	const finalProduct = { ...productInfo, productId: generateId() };
	setState('ADD_PRODUCT', finalProduct);

	productInfo = {
		productId: '',
		productName: '',
		productStockAmount: 0,
		productPrice: 0,
	};
	addProductBtn.disabled = true;
	Array.from(productForm.children).forEach((e) => (e.value = ''));

	return;
};

//Basic product input validation
const handleProductChange = (e) => {
	if (e.target.name === 'product-name') {
		if (e.target.value !== '') {
			productInfo.productName = e.target.value;
		} else {
			productInfo.productName = '';
		}
	} else if (e.target.name === 'product-price') {
		if (!Number(e.target.value) || !Number(e.target.value) > 0) {
			e.target.value = '';
			productInfo.productPrice = '';
		} else {
			productInfo.productPrice = Number(e.target.value);
		}
	} else if (e.target.name === 'product-quantity') {
		if (!Number(e.target.value) || !Number(e.target.value) > 0) {
			e.target.value = '';
			productInfo.productStockAmount = '';
		} else if (Math.floor(Number(e.target.value)) !== Number(e.target.value)) {
			e.target.value = Math.floor(Number(e.target.value));
		} else {
			productInfo.productStockAmount = Number(e.target.value);
		}
	}

	if (
		productInfo.productName &&
		productInfo.productPrice &&
		productInfo.productStockAmount
	) {
		addProductBtn.disabled = false;
	} else {
		addProductBtn.disabled = true;
	}
};

const handleRemoveFromCart = (e) => {
	if (e.target.id === 'remove-from-cart-btn') {
		globalState.cartState = globalState.cartState.filter(
			(c) =>
				c.productId !== e.target.parentElement.parentElement.dataset.product
		);
		triggerCartListRender();
		checkIsPayable();
	} else {
		return;
	}
};

const handleAddToCart = (e) => {
	if (e.target.id === 'add-to-cart-btn') {
		const productId = e.target.parentElement.parentElement.dataset.product;
		cartItem = {
			productId,
			quantity: 1,
		};

		setState('ADD_TO_CART', cartItem);
		cartItem = {
			productId: '',
			quantity: 0,
		};
	} else {
		return;
	}
};

let paymentState = {
	payerId: '',
	total: 0,
};

const checkIsPayable = () => {
	if (paymentState.payerId && globalState.cartState.length > 0) {
		placeOrderBtn.disabled = false;
	} else {
		placeOrderBtn.disabled = true;
	}
};

const handleSelectPayer = (e) => {
	if (e.target.dataset.account) {
		const payerId = e.target.dataset.account;
		paymentState = { ...paymentState, payerId };
		payerList.classList = '';
		openPayerList.textContent = formatName(e.target.textContent);
		checkIsPayable();
	} else {
		return;
	}
};

const handlePaymentSubmit = (e) => {
	e.preventDefault();
	console.log(paymentState);
	setState('PLACE_ORDER', paymentState);
	paymentState = {
		payerId: '',
		total: 0,
	};
	checkIsPayable();
};

const globalState = {
	accountState: [],
	historyState: [],
	// loading: {type: '', flag: false}
};

//loading state
// let isLoading = false;

//local state
let accountInfo = {
	name: '',
	balance: 0,
};

//local state
//intermediary -> history -> account - use and dump
// let toBeUpdated = {
//   to_ID : '',
//   from_ID : ''
// }

const setState = (type, payload) => {
	if (type === 'ADD_ACCOUNT') {
		globalState.accountState = [...globalState.accountState, payload];
		triggerAccountRender();
	}

	if (type === 'ADD_TRANSACTION_HISTORY') {
		// triggerHistoryRender();
		// triggerAccountRender();
	}

	console.log(globalState);
	triggerRender();
};

const triggerAccountRender = () => {
	const accountList = document.querySelector('.account-list');
	accountList.innerHTML = '';

	const generateAccountDOM = (id, name, balance) => {
		const li = document.createElement('li');
		li.dataset.id = id;
		li.textContent = `Name: ${name} - Balance: ${balance}`;

		return li;
	};

	globalState.accountState.forEach(({ id, name, balance }) =>
		accountList.append(generateAccountDOM(id, name, balance))
	);
};

const triggerRender = () => {
	const transactionList = document.querySelector('transaction-list');
};

const accountForm = document.querySelector('.add-user');

const handleAccountSubmit = (e) => {
	e.preventDefault();
	accountInfo.id = new Date().getTime().toString().slice(0, 10);
	setState('ADD_ACCOUNT', accountInfo);
	accountInfo = {};
	Array.from(e.target.children).forEach((v) => (v.value = ''));
};

const handleAccountChange = (e) => {
	e.preventDefault();

	if (e.target.name === 'account-name') {
		accountInfo.name = e.target.value;
	} else {
		accountInfo.balance = +e.target.value;
	}

	console.log(accountInfo);
};

accountForm.addEventListener('submit', handleAccountSubmit);
accountForm.addEventListener('keyup', handleAccountChange);

//populate fields from LS
// const getDataFromLS = () =>
//  window.addEventListener('DOMContentLoaded', getDataFromLS)

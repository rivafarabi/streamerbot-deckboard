const fetch = require('node-fetch');
const { log } = require('deckboard-kit');

class StreamerBot {
	constructor() {
		this.name = 'Streamer.bot';
		this.platforms = ['WINDOWS', 'LINUX'];
		this.configs = {
			address: {
				type: 'text',
				name: 'Address',
				descriptions: 'Example: 127.0.0.1',
				value: ''
			},
			port: {
				type: 'text',
				name: 'Port',
				descriptions: 'Example: 7474',
				value: ''
			}
		};
		this.inputs = [
			{
				label: 'Execute Action',
				value: 'streamerbot-action',
				icon: 'robot',
				color: '#5b00a0',
				input: [
					{
						label: 'Action',
						ref: 'actionId',
						type: 'input:autocomplete'
					},
					{
						label: 'Arguments',
						ref: 'args',
						hint: 'In JSON format. ex: {"fiz": "buzz"}',
						type: 'input:text'
					}
				]
			}
		];

		this.initExtension();
	}

	get selections() {
		return [
			{
				header: this.name
			},
			...this.inputs
		];
	}

	// Executes when the extensions loaded every time the app start.
	initExtension() {}

	getAutocompleteOptions(ref) {
		switch (ref) {
			case 'actionId':
				return this.fetchStreamerBotActions();
			default:
				return [];
		}
	}

	async fetchStreamerBotActions() {
		try {
			const { address, port } = this.configs;
			const url = `http://${address.value}:${port.value}/GetActions`;

			const response = await fetch(url, { method: 'GET' });
			const data = await response.json();

			return data.actions.map(({ id, name }) => ({
				value: id,
				label: name,
			}));
		} catch (err) {
			log.error('fetchStreamerBotActions', err);
			throw err;
		}
	}

	async doStreamerBotAction(id, args) {
		try {
			const { address, port } = this.configs;
			const url = `http://${address.value}:${port.value}/DoAction`;

			if (!!args && typeof args === 'string') args = JSON.parse(args);
			else args = {};

			const body = JSON.stringify({
				action: { id },
				args,
			});

			const response = await fetch(url, { method: 'POST', body });
			const data = await response.json();
			log.info('doStreamerBotAction', data);
		} catch (err) {
			log.error('doStreamerBotAction', err);
			throw err;
		}
	}

	execute(action, data) {
		switch (action) {
			case 'streamerbot-action':
				const { actionId, args } = data;
				this.doStreamerBotAction(actionId, args);
				break;
			default:
				break;
		}
	}
}

module.exports = (sendData) => new StreamerBot(sendData);

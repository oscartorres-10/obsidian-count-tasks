import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface CountTasksSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: CountTasksSettings = {
	mySetting: 'default',
};

export default class CountTasksPlugin extends Plugin {
	settings: CountTasksSettings;
	tasksCount: number = 0;

	async onload() {
		console.log('loading count tasks plugin');

		await this.loadSettings();

		this.app.workspace.on('file-open', async () => {
			const editor = this.app.workspace.activeEditor?.editor;
			const activeFile = this.app.workspace.getActiveFile();
			if (editor && activeFile) {
				const cachedRead = await this.app.vault.cachedRead(activeFile);
				console.log('cachedRead ->', cachedRead);
				const matchResults = cachedRead.match(/- \[ \]/g);
				console.log('matchResults ->', matchResults);
				this.tasksCount = matchResults?.length || 0;
			}
			// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
			const statusBarTasksCount = this.addStatusBarItem();
			statusBarTasksCount.setText(`Tasks: ${this.tasksCount}`);
		});

		// TODO: continue here, on editor change i need to remove the status bar item so it doesn't appear multiple times
		// this.app.workspace.on('...');

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log('unloading count-tasks plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: CountTasksPlugin;

	constructor(app: App, plugin: CountTasksPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}

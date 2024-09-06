import { App, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

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
		// adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarTasksCount = this.addStatusBarItem();

		this.app.workspace.on('file-open', async () => {
			const activeFile = this.app.workspace.getActiveFile();
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)

			if (activeView && activeFile) {
				const cachedRead = await this.app.vault.cachedRead(activeFile);
				const matchResults = cachedRead.match(/- \[ \]/g);
				this.tasksCount = matchResults?.length || 0;
			}
			statusBarTasksCount.setText(`Tasks: ${this.tasksCount}`);
		});

		// adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
		console.log('unloading count-tasks plugin');
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
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
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder('Enter your secret')
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

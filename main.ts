import { App, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface CountTasksSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: CountTasksSettings = {
	mySetting: 'default',
};

// TODO: remove status bar item if there is no editor open

export default class CountTasksPlugin extends Plugin {
	settings: CountTasksSettings;
  toDoTasks = 0;
  completedTasks = 0;
  totalTasks = 0;

	async onload() {
		console.log('loading count tasks plugin');
		await this.loadSettings();

		// adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarTasksCount = this.addStatusBarItem();
		const statusBarTasksCountSpan = statusBarTasksCount.createEl('span', {
			text: ``,
		});

		this.app.workspace.on('file-open', async () => {
			const activeFile = this.app.workspace.getActiveFile();
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)

			if (activeView && activeFile) {
				const cachedRead = await this.app.vault.cachedRead(activeFile);
        const toDoTasksMatchResults = cachedRead.match(/[-*+] \[ \]/g)
        const completedTasksMatchResults = cachedRead.match(/[-*+] \[[xX]\]/g)
        this.toDoTasks = toDoTasksMatchResults?.length || 0
        this.completedTasks = completedTasksMatchResults?.length || 0
        this.totalTasks = this.toDoTasks + this.completedTasks
        statusBarTasksCountSpan.setText(`✓ ${this.completedTasks}/${this.totalTasks}`);
			} else {
				statusBarTasksCountSpan.setText(`No Tasks`);
			}
		});

    // TODO: update tasks count when a task is checked
    // currently this executes but it's like "one step behind" it's executing when i check a task, hence when file changes, but it's not taking the latest value. e.g.: i change a tasks and cachedRead still has the empty [ ] and not [x]

		// this.app.workspace.on('quick-preview', async () => {
    //   console.log('quick-preview executed')
		// 	const activeFile = this.app.workspace.getActiveFile();

		// 	if (activeFile) {
		// 		const cachedRead = await this.app.vault.cachedRead(activeFile);
    //     const toDoTasksMatchResults = cachedRead.match(/[-*+] \[ \]/g)
    //     const completedTasksMatchResults = cachedRead.match(/[-*+] \[[xX]\]/g)
    //     this.toDoTasks = toDoTasksMatchResults?.length || 0
    //     this.completedTasks = completedTasksMatchResults?.length || 0
    //     this.totalTasks = this.toDoTasks + this.completedTasks
    //     statusBarTasksCountSpan.setText(`✓ ${this.completedTasks}/${this.totalTasks}`);
		// 	} 
		// });

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

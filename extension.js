import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Soup from 'gi://Soup';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';


export default class GnomeBtcExtension extends Extension {

    #loadingState = '₿ ...';
    #hiddenState = '₿';
    #url = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';

    enable() {
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);

        // LABEL
        this._label = new St.Label({
            text: this.#loadingState,
            y_align: Clutter.ActorAlign.CENTER
        });
        this._indicator.add_child(this._label);

        // TOGGLE SWITCH
        this._settings = this.getSettings();
        this._toggle = new PopupMenu.Switch(this._settings.get_boolean('hide-price'));
        this._menuItem = new PopupMenu.PopupSwitchMenuItem(_('Hide'), this._toggle.state);

        this._menuItem.connect('toggled', (_, state) => {
            this._settings.set_boolean('hide-price', state);
            state && this._label.set_text(this.#hiddenState)
        });
        this._indicator.menu.addMenuItem(this._menuItem);

        // DATA FETCHING
        this._httpSession = new Soup.Session();
        this._decoder = new TextDecoder();
        this._refresh();

        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
        this._settings = null;
    }

    _refresh() {
        const message = Soup.Message.new('GET', this.#url);

        this._refreshTimeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5, () => {

            // While the toggle is set to hidden, do nothing.
            const state = this._settings.get_boolean('hide-price');
            if (state) {
                return true;
            }

            this._httpSession.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null, function (session, res) {
                try {
                    const data = session.send_and_read_finish(res);

                    if (!data) throw new Error('you\'re probably disconnected from the internet')

                    const jsonString = this._decoder.decode(data.get_data());
                    const json = JSON.parse(jsonString);
                    this._label.set_text(`${parseFloat(json.price).toFixed(2)}`);
                } catch {
                    this._label.set_text(this.#loadingState);
                }
            }.bind(this));
            return true;
        });
    }
}

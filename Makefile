NAME=gnomebtcextension
DOMAIN=daniel.gomes.digital
EXTENSION_DIR=$(NAME)@$(DOMAIN)

.PHONY: install uninstall

install:
	@mkdir -p ~/.local/share/gnome-shell/extensions/$(EXTENSION_DIR)
	@cp extension.js ~/.local/share/gnome-shell/extensions/$(EXTENSION_DIR)
	@cp metadata.json ~/.local/share/gnome-shell/extensions/$(EXTENSION_DIR)
	@glib-compile-schemas schemas/
	@cp -r schemas ~/.local/share/gnome-shell/extensions/$(EXTENSION_DIR)

uninstall:
	@rm -rf ~/.local/share/gnome-shell/extensions/$(EXTENSION_DIR)


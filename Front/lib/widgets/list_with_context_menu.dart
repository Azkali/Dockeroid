import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class ListWithContextMenu<T> extends StatelessWidget {
	final List<T> items;
	final Widget Function(T) itemsWidgetFactory;
	final void Function(T, TapUpDetails) onTap;
	final void Function(T) onDoubleTap;
	final List<PopupMenuEntry> Function(T) menuItemsFactory;
	
	ListWithContextMenu(this.items, {
		@required this.itemsWidgetFactory,
		@required this.menuItemsFactory,
		this.onTap,
		this.onDoubleTap,
	});

	@override
	Widget build(BuildContext context){
		return ListView(
			children: this.items.map((item) => GestureDetector(
				onTapUp: this.onTap == null ? null : (details) => this.onTap(item, details),
				onDoubleTap: this.onDoubleTap == null ? null : () => this.onDoubleTap(item),
				onLongPressStart: (longPressInfos){
					return showMenu(
						items: this.menuItemsFactory(item),
						context: context,
						// From https://stackoverflow.com/a/54714628/4839162
						position: RelativeRect.fromRect(
							longPressInfos.globalPosition & Size(40, 40), // smaller rect, the touch area
							// From https://stackoverflow.com/a/52319524/4839162
							Offset.zero & MediaQuery.of(context).size// Bigger rect, the entire screen
						));
				},
				child: this.itemsWidgetFactory(item))).toList());
	}
}

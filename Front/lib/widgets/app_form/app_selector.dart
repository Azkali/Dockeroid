import 'package:dockeroid/logic/app_descriptor.dart';
import 'package:dockeroid/logic/net_utils.dart';
import 'package:dockeroid/logic/server_config.dart';
import 'package:dockeroid/theme.dart';
import 'package:dockeroid/widgets/app_descriptor_widget.dart';
import 'package:dockeroid/widgets/app_form/partial_navigator.dart';
import 'package:flutter/material.dart';

class AppSelector extends StatefulWidget {
	final ServerConfig serverConfig;

	AppSelector(this.serverConfig, {Key key}) : super(key: key);

	@override
	State<StatefulWidget> createState() => _AppSelectorState();
}

class _AppSelectorState extends State<AppSelector> with SingleTickerProviderStateMixin {
	AppDescriptor _selectedApp;
	Future<List<AppDescriptor>> _appsFuture;
	GlobalKey<NavigatorState> _appDetailsRouter;

	@override
	void initState(){
		super.initState();
		this._appsFuture = this._listApps();
		this._appDetailsRouter = GlobalKey();
	}

	Future<List<AppDescriptor>> _listApps() async {
		return httpGetServer<List<AppDescriptor>>(
			this.widget.serverConfig,
			'app/list',
			transform: (data) => (data as List<dynamic>).map((entry) => AppDescriptor.fromJson(entry)).toList());
	}

	void _gotoAppDetails(BuildContext context, AppDescriptor app){
		Navigator.of(context, rootNavigator: true).push(MaterialPageRoute(builder: (context){
			return AppDescriptorWidget.asDetails(app, selected: true, isFullscreen: true, onLeaveFullscreen: (){
				Navigator.of(context, rootNavigator: true).pop();
			});
		}));
	}

	Widget _buildAppSelector(BuildContext context) => FutureBuilder(
			future: this._appsFuture,
			builder: (context, snapshot){
				if(snapshot.connectionState != ConnectionState.done){
					return Center(child: CircularProgressIndicator());
				}

				final List<AppDescriptor> apps = snapshot.data;
				return ListView(
					shrinkWrap: true,
					children: apps.map((app) => Hero(tag: app, child: AppDescriptorWidget.asListItem(
						app,
						onTap: () async {
							final navigator = this._appDetailsRouter.currentState;
							navigator.maybePop();

							if(this._selectedApp == app){
								setState(() {
									this._selectedApp = null;
								});
							} else {
								setState(() {
									this._selectedApp = app;
								});
								navigator.push(PageRouteBuilder(
									pageBuilder: (context, anim1, anim2){
										return this._buildSelectedAppDetails(context);
									},
									transitionsBuilder: (context, anim1, anim2, widget){
										return new SlideTransition(
											position: Tween<Offset>(begin: Offset(0.0, 1.0), end: Offset.zero).animate(CurvedAnimation(
												parent: anim1,
												curve: Interval(0.00, 0.50, curve: Curves.easeInOut))),
											child: widget
										);
									}
								));
							}
						},
						selected: this._selectedApp == app))).toList());
			});
	
	// From https://stackoverflow.com/a/55215961/4839162
	NavigatorState _getNavigator(BuildContext context, {bool rootNavigator = false, ValueKey<String> key}) {
		assert(rootNavigator != null);
		final NavigatorState state = Navigator.of(
			context,
			rootNavigator: rootNavigator,
		);
		if (rootNavigator) {
			return state;
		} else if (state.widget.key == key) {
			return state;
		}
		try {
			return _getNavigator(state.context, key: key);
		} catch (e) {
			throw ErrorDescription('Could not find the specified navigator');
		}
	}

	Widget _buildSelectedAppDetails(BuildContext context) => Hero(tag: this._selectedApp, child: GestureDetector(
			behavior: HitTestBehavior.opaque,
			onVerticalDragUpdate: (infos){
				if(infos.delta.dy < -5){
					this._gotoAppDetails(context, this._selectedApp);
				}
			},
			child: AppDescriptorWidget.asDetails(this._selectedApp, isFullscreen: false, onGoFullscreen: (){
				this._gotoAppDetails(context, this._selectedApp);
			})));

	Widget _buildBody(BuildContext context){
		return Column(
			mainAxisSize: MainAxisSize.max,
			children: [
				Expanded(flex: 100, child: this._buildAppSelector(context)),
				ConstrainedBox(
					constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.5),
					child: Container(
					color: greenBlueColor,child: PartialNavigator(
						key: this._appDetailsRouter,
						onGenerateRoute: (routeSettings){
							print(routeSettings.name);
							print(routeSettings.isInitialRoute);
							return PageRouteBuilder(
								pageBuilder: (context, anim1, anim2){
									return Center(child: Container(child: Text('Hello world'), color: redColor,));
								},
								transitionsBuilder: (context, anim1, anim2, widget){
									return new SlideTransition(
										position: Tween<Offset>(begin: Offset(0.0, 1.0), end: Offset.zero).animate(CurvedAnimation(
											parent: anim1,
											curve: Interval(0.00, 0.50, curve: Curves.easeInOut))),
										child: widget
									);
								}
							);
						})))]);
	}
	
	@override
	Widget build(BuildContext context) {
		return Scaffold(
			appBar: AppBar(
				// Here we take the value from the MyHomePage object that was created by
				// the App.build method, and use it to set our appbar title.
				title: Text("Select an app")),
			body: this._buildBody(context),
			floatingActionButton: this._selectedApp != null ? Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
				Padding(padding: EdgeInsets.all(8), child: FloatingActionButton(heroTag: 'settingsButton', child: Icon(Icons.settings), onPressed: (){
					print('Settings');
				})),
				Padding(padding: EdgeInsets.all(8), child:FloatingActionButton(heroTag: 'autoplayButton', child: Icon(Icons.play_arrow), onPressed: (){
					print('Autostart');
				}))
			]) : null);
	}
}

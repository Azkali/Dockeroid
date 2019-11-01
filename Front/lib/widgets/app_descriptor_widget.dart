import 'package:dockeroid/logic/app_descriptor.dart';
import 'package:dockeroid/logic/app_review.dart';
import 'package:dockeroid/logic/net_utils.dart';
import 'package:dockeroid/logic/utils.dart';
import 'package:dockeroid/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_svg/svg.dart';
import 'package:smooth_star_rating/smooth_star_rating.dart';

enum EAppDescriptorWidgetMode {
	ListItem,
	Summary,
	Details,
}

class _AppDescriptorDetailsWidget extends StatefulWidget {
	final AppDescriptor app;
	final bool selected;
	final bool isFullscreen;
	final void Function() onGoFullscreen;
	final void Function() onLeaveFullscreen;

	_AppDescriptorDetailsWidget(this.app, {this.selected, this.isFullscreen, this.onGoFullscreen, this.onLeaveFullscreen, Key key}): super(key: key);

	@override
	_AppDescriptorDetailsWidgetState createState() => _AppDescriptorDetailsWidgetState();
}
class _AppDescriptorDetailsWidgetState extends State<_AppDescriptorDetailsWidget> with SingleTickerProviderStateMixin {
	TabController _tabBarController;
	AppDescriptorVersion _version;
	Future<List<AppReview>> _reviewsFuture;
	Future<int> _issuesCountFuture;

	@override
	void initState() {
		super.initState();
		this._tabBarController = TabController(length: 3, initialIndex: 0, vsync: this);
		this._onAppChanged();
	}

	@override
	void didUpdateWidget (covariant _AppDescriptorDetailsWidget oldWidget) {
		super.didUpdateWidget(oldWidget);
		if(oldWidget.app != this.widget.app){
			this._onAppChanged();
		}
	}

	void _onAppChanged(){
		this._issuesCountFuture = this._countIssues();
		this._version = this.widget.app.versions.last;
	}

	Future<List<AppReview>> _getReviews(){
		return Future.value([
			AppReview(app: this.widget.app, content: 'Excellent', date: DateTime.now().subtract(Duration(days: 5)), rating: 5, user: 'Some One'),
			AppReview(app: this.widget.app, content: 'Somewhat good', date: DateTime.now().subtract(Duration(days: 3)), rating: 2.5, user: 'Other One'),
			AppReview(app: this.widget.app, content: '**Awesome!** Saved me *days*.\n\nCloud computing for the people!', date: DateTime.now().subtract(Duration(hours: 36)), rating: 5, user: 'Anon Ymous'),
			AppReview(app: this.widget.app, content: '**Sucks**', date: DateTime.now().subtract(Duration(days: 1)), rating: 0, user: 'An asshole'),
			AppReview(app: this.widget.app, date: DateTime.now().subtract(Duration(hours: 12)), rating: 5, user: 'Alice Bob'),
			AppReview(app: this.widget.app, date: DateTime.now().subtract(Duration(hours: 6)), rating: 5, user: 'John Doe'),
		]);
	}

	Future<int> _countIssues() async {
		switch(this.widget.app.repository?.type){
			case ERepoType.Github:
			final repoUri = this.widget.app.repository.url;
			final targetUri = Uri(
				scheme: 'https',
				host: 'api.github.com',
				path: repoUri.path.replaceAllMapped(RegExp(r'^\/([^\/]+\/[^\/]+).*$'), (m) => '/repos/${m.group(1)}/issues'));
			return await httpGet<int>(targetUri, transform: (responseJson){
				if(responseJson is List<dynamic>){
					return responseJson.length;
				}
				throw new Error();
			});

			default:
			return null;
		}
	}

	Widget _buildReviews(BuildContext context){
		this._reviewsFuture = this._getReviews();
		return FutureBuilder(
			future: this._reviewsFuture,
			builder: (context, snapshot){
				if(snapshot.connectionState != ConnectionState.done){
					return Text('Pending');
				}

				final List<AppReview> reviews = snapshot.data;
				final mediaQuery = MediaQuery.of(context);
				return ListView(children: reviews.map((review) => Card(child: Column(children: [
					ListTile(
						leading: CircleAvatar(child: Text(getInitials(review.user))),
						title: Text(review.user),
						subtitle: SmoothStarRating(
							allowHalfRating: false,
							starCount: 5,
							rating: review.rating,
							size: mediaQuery.size.height / 25,
							color: Colors.green,
							borderColor: Colors.green,
							spacing:0.0
						)
					),
					review.content != null ? Padding(padding: EdgeInsets.all(8), child: MarkdownBody(data: review.content)) : null
				].where((v) => v != null).toList(growable: false)))).toList(growable: false));
			},
		);
	}

	Widget _displayOpenIssues(BuildContext context){
		return Row(children: <Widget>[
			Text('Open issues: '),
			FutureBuilder<int>(
				future: this._issuesCountFuture,
				builder: (context, snapshot){
					if(snapshot.connectionState != ConnectionState.done){
						return Row(children: [Text('Pending... '), CircularProgressIndicator()]);
					}

					if(snapshot.hasError){
						print((snapshot.error as Error).stackTrace);
						if(snapshot.error is Error){
							return Text('Oops, an error occured! ${(snapshot.error as Error).toString()}');
						}
						return Text('Oops, an error occured! ${snapshot.error.toString()}');
					} else if(snapshot.data != null ){
						return Text('${snapshot.data}');
					} else {
						return Text('Not supported');
					}
				}
			)
		]);
	}

	Widget _buildChangelogs(BuildContext context){
		return Column(
			children: this.widget.app.versions.map((v) => Card(
				child: Column(children: [
					ListTile(
						title: Text(v.version),
						subtitle: v.releaseDate != null ? Text('Released on ${v.releaseDate.toIso8601String()}') : null),
					Padding(padding: EdgeInsets.all(8), child: MarkdownBody(data: v.changelog ?? '*No changelog*'))]))).toList(growable: false));
	}

	Widget _buildDetails(BuildContext context){
		return Expanded( child: Column(
			children: <Widget>[
				this._displayOpenIssues(context),
				TabBar(
					controller: this._tabBarController,
					tabs: [
						Tab(icon: Row(children: [Icon(Icons.star), Text('Reviews')])),
						Tab(icon: Row(children: [Icon(Icons.subscriptions), Text('Subscribers')])),
						Tab(icon: Row(children: [Icon(Icons.announcement), Text('Changelogs')]))]),
				Expanded(child: TabBarView(
					controller: this._tabBarController,
					children: [
						Padding( padding: EdgeInsets.all(8), child: this._buildReviews(context)),
						Padding( padding: EdgeInsets.all(8), child: Text('Subscribers')),
						Padding( padding: EdgeInsets.all(8), child: this._buildChangelogs(context))]))].where((v) => v != null).toList(growable: false)));
	}

	@override
	Widget build(BuildContext context) {
		return Card(
			child: Column(
				mainAxisSize: MainAxisSize.min,
				children: [
					ListTile(
						selected: this.widget.selected,
						title: Text(this.widget.app.name),
						leading: AppDescriptorWidget.getAvatar(this.widget.app),
						subtitle: Row(
								children: [
									Text('Type '),
									Chip(label: Text(getAppTypeLabel(this.widget.app.type)))]),
						trailing: DropdownButton<String>(
							items: this.widget.app.versions.map((v) => DropdownMenuItem(
								child: Text(v.version),
								value: v.version)).toList(),
							onChanged: (newVersion){
								setState((){
									this._version = this.widget.app.versions.singleWhere((v) => v.version == newVersion);
								});
							},
							value: this._version.version,
						),
					),
					Padding(padding: EdgeInsets.all(8), child: MarkdownBody(data: this._version?.description ?? '*No description provided.*')),
					this.widget.isFullscreen ?
						FlatButton(child: Center(child: Icon(Icons.arrow_downward)), onPressed: this.widget.onLeaveFullscreen) :
						FlatButton(child: Center(child: Icon(Icons.arrow_upward)), onPressed: this.widget.onGoFullscreen),
					this.widget.isFullscreen ? this._buildDetails(context) : null,
				].where((v) => v != null).toList()));
	}

	@override
	void dispose(){
		super.dispose();
		this._tabBarController?.dispose();
	}
}

class AppDescriptorWidget extends StatelessWidget {
	final AppDescriptor app;
	final EAppDescriptorWidgetMode mode;
	final void Function() onTap;
	final bool selected;

	AppDescriptorWidget._internal(this.app, this.mode, {this.onTap, this.selected, Key key}): super(key: key);

	static Widget asListItem(AppDescriptor app, {void Function() onTap, bool selected, Key key}){
		return AppDescriptorWidget._internal(app, EAppDescriptorWidgetMode.ListItem, onTap: onTap, selected: selected ?? false, key: key);
	}
	static Widget asSummary(AppDescriptor app, {void Function() onTap, bool selected, Key key}){
		return AppDescriptorWidget._internal(app, EAppDescriptorWidgetMode.Summary, onTap: onTap, selected: selected ?? false, key: key);
	}
	static Widget asDetails(
		AppDescriptor app,
		{
			bool selected,
			@required bool isFullscreen,
			void Function() onGoFullscreen,
			void Function() onLeaveFullscreen,
			Key key,
		}){
		return _AppDescriptorDetailsWidget(
			app,
			selected: selected ?? false,
			isFullscreen: isFullscreen,
			onGoFullscreen: onGoFullscreen,
			onLeaveFullscreen: onLeaveFullscreen,
			key: key);
	}

	static Widget getAvatar(AppDescriptor app){
		if(app.icon == null){
			return CircleAvatar(child: Text(getInitials(app.name)));
		} else if(app.icon.endsWith('.svg')){
			return CircleAvatar(child: SvgPicture.network(app.icon));
		} else {
			return CircleAvatar(backgroundImage: NetworkImage(app.icon));
		}
	}

	Widget _getAvatar() => AppDescriptorWidget.getAvatar(this.app);

	Widget _buildListItem(BuildContext context) => Card(
		child: ListTile(
			selected: this.selected,
			onTap: this.onTap,
			title: Text(this.app.name),
			leading: this._getAvatar(),
			subtitle: Row(
				children: [
					Text('Type '),
					Chip(label: Text(getAppTypeLabel(app.type)))])
		));

	Widget _builSummary(BuildContext context) => Card(
		child: ListTile(
			selected: this.selected,
			onTap: this.onTap,
			title: Text(this.app.name),
			leading: this._getAvatar(),
		));

	@override
	Widget build(BuildContext context) {
		switch(this.mode){
			case EAppDescriptorWidgetMode.ListItem:
			return this._buildListItem(context);

			case EAppDescriptorWidgetMode.Summary:
			return this._builSummary(context);

			default: throw new Error();
		}
	}
}

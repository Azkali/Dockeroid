import 'package:dockeroid/logic/app_descriptor.dart';

class AppReview {
	final AppDescriptor app;
	final String content;
	final DateTime date;
	final String user;
	final double rating;

	AppReview({this.app, this.content, this.date, this.user, this.rating});
}

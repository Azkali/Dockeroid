import 'package:dockeroid/logic/app_info.dart';

class DockerAppInfo extends AppInfo {
	final String image;

	DockerAppInfo({String key, EAppType type, String appName, String version, this.image}) : super(key: key, type: type, appName: appName, version: version);
}

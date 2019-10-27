import 'package:dockeroid/logic/app_info.dart';

import 'app_descriptor.dart';

class DockerAppInfo extends AppInfo {
	final String image;

	DockerAppInfo({String key, EAppType type, String appName, String version, AppDescriptor appDescriptor, this.image}) : super(key: key, type: type, appName: appName, version: version, appDescriptor: appDescriptor);
}

enum EAppType{
	Docker,
	Qemu,
}

class AppDescriptor{
	final String name;
	final EAppType type;
	final List<String> versions;

	const AppDescriptor(this.name, this.type, this.versions);

	factory AppDescriptor.fromJson(dynamic content){
		EAppType type;
		switch(content['type']){
			case "docker":
			type = EAppType.Docker;
			break;

			case "qemu":
			type = EAppType.Qemu;
			break;

			default:
			print(content);
			throw new Error();
		}
		return AppDescriptor(content['appName'], type, (content['version'] as List<dynamic>).map((v) => v['version'] as String).toList());
	}
}

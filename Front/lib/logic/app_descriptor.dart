import 'dart:convert';

enum EAppType{
	Docker,
	Qemu,
}

enum ERepoType {
	Github,
	Other,
}

class _AppDescriptorRepository {
	final Uri url;
	final ERepoType type;

	_AppDescriptorRepository._internal({this.url, this.type});

	factory _AppDescriptorRepository.fromJson(dynamic content){
		// If provided a simple string, try to auto-deduce type
		if(content is String){
			final uri = Uri.parse(content);
			if(uri.host.contains('github.com')){
				return _AppDescriptorRepository._internal(type: ERepoType.Github, url: uri);
			} else {
				return _AppDescriptorRepository._internal(type: ERepoType.Other, url: uri);
			}
		} else if(content is Map<String, String>){
			final Uri url = Uri.parse(content['url']);
			final String type = content['type'];
			switch(type){
				case "github":
				return _AppDescriptorRepository._internal(type: ERepoType.Github, url: url);

				default:
				return _AppDescriptorRepository._internal(type: ERepoType.Other, url: url);
			}
		} else {
			throw Error();
		}
	}
}

class AppDescriptorVersion {
	final String version;
	final String description;
	final String changelog;
	final DateTime releaseDate;

	AppDescriptorVersion(this.version, this.releaseDate, {this.description, this.changelog});

	factory AppDescriptorVersion.fromJson(dynamic content){
		return AppDescriptorVersion(
			content['version'],
			content['releaseDate'] != null ? DateTime.parse(content['releaseDate']) : null,
			description: content['description'],
			changelog: content['changelog']);
	}
}

class AppDescriptor{
	final String name;
	final EAppType type;
	final List<AppDescriptorVersion> versions;
	final String icon;
	final _AppDescriptorRepository repository;

	AppDescriptor({this.name, this.type, this.versions, this.icon, this.repository});

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
			throw new Error();
		}
		return AppDescriptor(
			name: content['appName'],
			type: type,
			versions: (content['versions'] as List<dynamic>).map((v) => AppDescriptorVersion.fromJson(v)).toList(),
			icon: content['icon'],
			repository: content['repository'] != null ? _AppDescriptorRepository.fromJson(content['repository']) : null );
	}
}

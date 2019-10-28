import 'app_descriptor.dart';

String getInitials(String val) => val.splitMapJoin(
	RegExp(r'(?:^|\W)(\w)'),
	onMatch: (m) => m.group(1)[0].toUpperCase(),
	onNonMatch: (m) => '');

String getAppTypeLabel(EAppType type){
	switch(type){
		case EAppType.Docker:
			return 'Docker';

		case EAppType.Qemu:
			return 'Qemu';

		default:
			throw new Error();
	}
}

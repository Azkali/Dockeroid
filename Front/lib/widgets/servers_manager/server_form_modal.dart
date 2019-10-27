import 'package:dockeroid/logic/server_config.dart';
import 'package:flutter/material.dart';

class ServerFormModal {
	static Future<dynamic> openForm(BuildContext scaffoldContext, [ServerConfig formData]){
		return showDialog(
			context: scaffoldContext,
			builder: (dialogContext) => AlertDialog(
				content: ServerForm(scaffoldContext, formData)));
	}
}

class ServerForm extends StatefulWidget {
	final BuildContext scaffoldContext;
	final ServerConfig serverConfig;

	ServerForm(this.scaffoldContext, this.serverConfig);

	@override
	_ServerFormState createState() => _ServerFormState();
}

// Define a corresponding State class.
// This class holds data related to the Form.
class _ServerFormState extends State<ServerForm> {
	static final _formKey = GlobalKey<FormState>();

	// Create a text controller. Later, use it to retrieve the
	// current value of the TextField.
	TextEditingController _labelController;
	TextEditingController _schemeController;
	TextEditingController _hostController;
	TextEditingController _portController;
	TextEditingController _pathController;

	@override
	void initState() {
		super.initState();
		this._labelController = TextEditingController(text: this.widget.serverConfig?.label);
		this._schemeController = TextEditingController(text: this.widget.serverConfig?.uri?.scheme);
		this._hostController = TextEditingController(text: this.widget.serverConfig?.uri?.host);
		this._portController = TextEditingController(text: this.widget.serverConfig?.uri?.port?.toString() ?? '4000');
		this._pathController = TextEditingController(text: this.widget.serverConfig?.uri?.path);
	}

	@override
	void dispose() {
		// Clean up the controller when the widget is removed from the
		// widget tree.
		_labelController.dispose();
		_schemeController.dispose();
		_hostController.dispose();
		_portController.dispose();
		_pathController.dispose();
		super.dispose();
	}
	

	static Widget _makeFormInput(String label, {
		String placeholder,
		String Function(String) validator,
		TextInputType keyboardType,
		bool required = false,
		@required TextEditingController controller,
	}){
		return Column(
			children: <Widget>[
				Text(label, style: required ? TextStyle(fontWeight: FontWeight.bold) : null),
				TextFormField(
					controller: controller,
					decoration: placeholder?.isEmpty ?? true ? null : InputDecoration(
						hintText: placeholder
					),
					validator: validator,
					keyboardType: keyboardType,
				),
			],
		);
	}

	@override
	Widget build(BuildContext dialogContext) {
		return Form(
			key: _formKey,
			child: Column(
				mainAxisSize: MainAxisSize.min,
				children: <Widget>[
					Padding(
						padding: EdgeInsets.all(8.0),
						child: _ServerFormState._makeFormInput("Label", required: true, placeholder: 'My server', validator: (value) => value.isEmpty ? 'Invalid' : null, controller: this._labelController)),
					Padding(
						padding: EdgeInsets.all(8.0),
						child: Row(
							mainAxisAlignment: MainAxisAlignment.spaceEvenly,
							children: [
								Flexible(child: _ServerFormState._makeFormInput('Scheme', required: true, placeholder: 'https', validator: (value) => value.isEmpty ? 'Invalid' : null, controller: this._schemeController)),
								Flexible(child: _ServerFormState._makeFormInput('Host', required: true, placeholder: '10.0.2.2', validator: (value) => value.isEmpty ? 'Invalid' : null, controller: this._hostController)),
								Flexible(child: _ServerFormState._makeFormInput('Port', keyboardType: TextInputType.number, controller: this._portController)),
								Flexible(child: _ServerFormState._makeFormInput('Path', placeholder: "/docker", controller: this._pathController)),
							])),
					Padding(
						padding: const EdgeInsets.all(8.0),
						child: RaisedButton(
							child: Text("Save"),
							onPressed: () async  {
								// Validate returns true if the form is valid, otherwise false.
								if (_formKey.currentState.validate()) {
									// If the form is valid, display a snackbar. In the real world,
									// you'd often call a server or save the information in a database.

									Scaffold
										.of(this.widget.scaffoldContext)
										.showSnackBar(SnackBar(content: Text('Saving')));
									Navigator.of(dialogContext, rootNavigator: true).pop('dialog');

									final label = this._labelController.text;
									final uri = Uri(
										scheme: this._schemeController.text,
										host: this._hostController.text,
										port: int.parse(this._portController.text),
										path: this._pathController.text,
									);
									ServerConfig configToSave;
									if(this.widget.serverConfig == null){
										configToSave = new ServerConfig(label, uri);
									} else {
										configToSave.label = label;
										configToSave.uri = uri;
									}
									await configToSave.save();
								}
							}))]));
	}
}

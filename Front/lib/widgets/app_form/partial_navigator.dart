import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class PartialNavigator extends Navigator {
  /// Creates a widget that maintains a stack-based history of child widgets.
  ///
  /// The [onGenerateRoute] argument must not be null.
  const PartialNavigator({
    Key key,
    String initialRoute,
    @required Route<dynamic> Function(RouteSettings) onGenerateRoute,
    Route<dynamic> Function(RouteSettings) onUnknownRoute,
    List<NavigatorObserver> observers,
  }) : assert(onGenerateRoute != null),
       super(key: key, initialRoute: initialRoute, onGenerateRoute: onGenerateRoute, onUnknownRoute: onUnknownRoute, observers: observers);

  @override
  PartialNavigatorState createState() => PartialNavigatorState();
}


class PartialNavigatorState extends NavigatorState {
  final GlobalKey<OverlayState> _overlayKey = GlobalKey<OverlayState>();
  final List<Route<dynamic>> _history = <Route<dynamic>>[];
  final Set<Route<dynamic>> _poppedRoutes = <Route<dynamic>>{};

  /// The [FocusScopeNode] for the [FocusScope] that encloses the routes.
  final FocusScopeNode focusScopeNode = FocusScopeNode(debugLabel: 'Navigator Scope');

	@override
  final List<OverlayEntry> _initialOverlayEntries = <OverlayEntry>[];

  bool _debugLocked = false; // used to prevent re-entrant calls to push, pop, and friends

  /// Complete the lifecycle for a route that has been popped off the navigator.
  ///
  /// When the navigator pops a route, the navigator retains a reference to the
  /// route in order to call [Route.dispose] if the navigator itself is removed
  /// from the tree. When the route is finished with any exit animation, the
  /// route should call this function to complete its lifecycle (e.g., to
  /// receive a call to [Route.dispose]).
  ///
  /// The given `route` must have already received a call to [Route.didPop].
  /// This function may be called directly from [Route.didPop] if [Route.didPop]
  /// will return true.
  void finalizeRoute(Route<dynamic> route) {
    _poppedRoutes.remove(route);
    route.dispose();
  }

  /// Whether a route is currently being manipulated by the user, e.g.
  /// as during an iOS back gesture.
  bool get userGestureInProgress => _userGesturesInProgress > 0;
  int _userGesturesInProgress = 0;

  /// The navigator is being controlled by a user gesture.
  ///
  /// For example, called when the user beings an iOS back gesture.
  ///
  /// When the gesture finishes, call [didStopUserGesture].
  void didStartUserGesture() {
    _userGesturesInProgress += 1;
    if (_userGesturesInProgress == 1) {
      final Route<dynamic> route = _history.last;
      final Route<dynamic> previousRoute = !route.willHandlePopInternally && _history.length > 1
          ? _history[_history.length - 2]
          : null;
      // Don't operate the _history list since the gesture may be canceled.
      // In case of a back swipe, the gesture controller will call .pop() itself.

      for (NavigatorObserver observer in widget.observers)
        observer.didStartUserGesture(route, previousRoute);
    }
  }

  /// A user gesture completed.
  ///
  /// Notifies the navigator that a gesture regarding which the navigator was
  /// previously notified with [didStartUserGesture] has completed.
  void didStopUserGesture() {
    assert(_userGesturesInProgress > 0);
    _userGesturesInProgress -= 1;
    if (_userGesturesInProgress == 0) {
      for (NavigatorObserver observer in widget.observers)
        observer.didStopUserGesture();
    }
  }

  final Set<int> _activePointers = <int>{};

  void _handlePointerDown(PointerDownEvent event) {
    _activePointers.add(event.pointer);
  }

  void _handlePointerUpOrCancel(PointerEvent event) {
    _activePointers.remove(event.pointer);
  }

  @override
  Widget build(BuildContext context) {
    assert(!_debugLocked);
    assert(_history.isNotEmpty);
    return Listener(
      onPointerDown: _handlePointerDown,
      onPointerUp: _handlePointerUpOrCancel,
      onPointerCancel: _handlePointerUpOrCancel,
      child: AbsorbPointer(
        absorbing: false, // it's mutated directly by _cancelActivePointers above
        child: FocusScope(
          node: focusScopeNode,
          autofocus: true,
          child: Container(color: Colors.deepOrange.shade100, child: Padding(padding: EdgeInsets.all(8), child: Overlay(
            key: _overlayKey,
            initialEntries: _initialOverlayEntries,
          )),
        )),
      ),
    );
  }
}

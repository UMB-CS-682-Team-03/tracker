from roundup.rest import Routing, RestfulInstance,  _data_decorator

class RestfulInstance:

    @Routing.route("/roles", 'GET')
    @_data_decorator
    def get_roles(self, input):
        """Return all defined roles. The User class property
           roles is a string but simulate it as a MultiLink
           to an actual Roles class.
        """
        return 200, {"collection": [ {"id": rolename, "name": rolename}
                  for rolename in list(self.db.security.role.keys())]}
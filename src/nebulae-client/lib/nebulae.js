/** Resource, Resource Type Contract */
var nebulae;

(function (nebulae) {
    var ResourceType = (function () {
        function ResourceType(id, name, parent, schema) {
            this._id = id;
            this.name = name;
            this.parent = parent;
            this.schema = schema;
        }
        return ResourceType;
    }());
    nebulae.ResourceType = ResourceType;

    var Resource = (function () {
        function Resource(id, name, resourceType) {
            var self = this;
            this._id = id;
            this.name = ko.observable(name);
            this.resourceType = resourceType;

            if (resourceType.schema && resourceType.schema.length) {
                resourceType.schema.map(function (v, i, Arr) {
                    self[Object.getOwnPropertyNames(v)[0]] = ko.observable();
                });
            }
        }
        return Resource;
    }());
    nebulae.Resource = Resource;

    var RelationshipType = (function () {
        function RelationshipType(name, sourceType, targetType) {
            this.name = name;
            this.sourceType = sourceType;
            this.targetType = targetType;
        }
        return RelationshipType;
    }());
    nebulae.RelationshipType = RelationshipType;

    var Relationship = (function () {
        function Relationship(family, source, target) {
            this.family = family;
            this.source = source;
            this.target = target;
        }
        return Relationship;
    }());
    nebulae.Relationship = Relationship;

    nebulae.newId = function () {
        var dt = new Date();
        var num = Math.floor(Math.random() * 100 * Date.now());
        return "" + dt.getFullYear() + dt.getMonth() + dt.getDay() + dt.getHours() + dt.getMinutes() + "_" + num;
    };

})(nebulae || (nebulae = {}));
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
        function Resource(name, parent, resourceType) {
            this.name = name;
            this.parent = parent;
            this.resourceType = resourceType;
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

})(nebulae || (nebulae = {}));
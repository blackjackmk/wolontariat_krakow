from rest_framework import permissions

class IsOrganization(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rola == 'organizacja')

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    The author (organization) can edit/delete their own review.
    Others can read.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.organizacja == request.user.organizacja

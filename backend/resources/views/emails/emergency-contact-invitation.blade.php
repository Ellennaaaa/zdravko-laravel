<!DOCTYPE html>
<html>
<body>
    <h2>Zdravko Emergency Contact Invitation</h2>

    <p>Hello {{ $invitation->name }},</p>

    <p>You have been invited to become an emergency contact in the Zdravko app.</p>

    <p>Relationship: {{ $invitation->relationship }}</p>

    <p>
        <a href="{{ $acceptUrl }}">
            Accept invitation
        </a>
    </p>

    <p>If you do not want to accept this invitation, you can ignore this email.</p>
</body>
</html>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation TASHO</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f5f5f7;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 13px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            overflow: hidden;
        }
        .header {
            background: #6C5CE7;
            padding: 32px 40px;
            text-align: center;
        }
        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }
        .header p {
            color: rgba(255,255,255,0.8);
            margin: 8px 0 0;
        }
        .content {
            padding: 40px;
        }
        .content h2 {
            font-size: 22px;
            color: #1a202c;
            margin-top: 0;
        }
        .content p {
            color: #4a5568;
            line-height: 1.6;
        }
        .team-info {
            background: #f7fafc;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
        }
        .team-info strong {
            color: #2d3748;
        }
        .button {
            display: inline-block;
            background: #6C5CE7;
            color: white;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
        }
        .button:hover {
            background: #5a4bd1;
        }
        .footer {
            text-align: center;
            padding: 24px 40px;
            background: #f7fafc;
            color: #a0aec0;
            font-size: 14px;
        }
        .footer a {
            color: #6C5CE7;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TASHO</h1>
            <p>Plateforme pour professionnels des médias</p>
        </div>

        <div class="content">
            <h2>Vous êtes invité !</h2>
            
            <p>
                Bonjour{{ $invitation->email ? ' ' . $invitation->email : '' }},
            </p>

            <p>
                <strong>{{ $invitedBy->name }}</strong> vous invite à rejoindre l'équipe 
                <strong>{{ $team->name }}</strong> sur TASHO.
            </p>

            <div class="team-info">
                <p style="margin: 0;">
                    <strong>Rôle :</strong> {{ $roleLabel }}<br>
                    <strong>Équipe :</strong> {{ $team->name }}<br>
                    <strong>Invitation valable jusqu'au :</strong> 
                    {{ $invitation->expires_at->format('d/m/Y à H:i') }}
                </p>
            </div>

            <p>
                TASHO est la plateforme tout-en-un pour gérer vos projets créatifs,
                stocker vos fichiers et collaborer avec votre équipe en toute simplicité.
            </p>

            <div style="text-align: center;">
                <a href="{{ $acceptUrl }}" class="button">
                    Accepter l'invitation
                </a>
            </div>

            <p style="margin-top: 24px; font-size: 14px; color: #a0aec0;">
                Si vous ne souhaitez pas rejoindre cette équipe, ignorez simplement cet email.
                L'invitation expirera automatiquement dans 7 jours.
            </p>
        </div>

        <div class="footer">
            <p style="margin: 0;">
                &copy; {{ date('Y') }} TASHO. Tous droits réservés.<br>
                <a href="{{ config('app.url') }}">{{ config('app.name') }}</a>
            </p>
        </div>
    </div>
</body>
</html>
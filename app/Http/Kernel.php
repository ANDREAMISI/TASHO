protected $routeMiddleware = [
    // ... existing middleware
    'team.member' => \App\Http\Middleware\TeamMember::class,
    'project.member' => \App\Http\Middleware\ProjectMember::class,
    'super.admin' => \App\Http\Middleware\SuperAdmin::class,
];
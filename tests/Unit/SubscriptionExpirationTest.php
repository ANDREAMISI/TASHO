<?php

namespace Tests\Unit;

use App\Models\Subscription;
use Carbon\Carbon;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SubscriptionExpirationTest extends TestCase
{
    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    #[DataProvider('expirationDates')]
    public function test_expiring_soon_only_applies_to_active_subscriptions_within_21_days(
        string $status,
        string $endDate,
        bool $expected
    ): void {
        Carbon::setTestNow('2026-11-03 12:00:00');

        $subscription = new Subscription([
            'status' => $status,
            'end_date' => $endDate,
        ]);

        $this->assertSame($expected, $subscription->isExpiringSoon(21));
    }

    public static function expirationDates(): array
    {
        return [
            'active and inside three weeks' => ['active', '2026-11-24 00:00:00', true],
            'active and more than three weeks away' => ['active', '2026-11-25 00:00:00', false],
            'active but already expired' => ['active', '2026-11-02 00:00:00', false],
            'inactive subscription' => ['inactive', '2026-11-10 00:00:00', false],
        ];
    }
}

{{-- Version diff modal. Inline styles: the panel's precompiled CSS has no classes for custom views. --}}
<div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.5; max-height: 70vh; overflow: auto; border-radius: 8px; border: 1px solid rgba(127,127,127,.25);">
    @if (! $lines)
        <div style="padding: 12px;">Версии совпадают.</div>
    @endif
    @foreach ($lines as $line)
        <div style="white-space: pre-wrap; word-break: break-word; padding: 0 12px; {{ match ($line['type']) {
            'add' => 'background: rgba(34,197,94,.15);',
            'del' => 'background: rgba(239,68,68,.15);',
            'hunk' => 'background: rgba(127,127,127,.12); color: rgb(107,114,128);',
            default => '',
        } }}">{{ $line['text'] }}</div>
    @endforeach
</div>

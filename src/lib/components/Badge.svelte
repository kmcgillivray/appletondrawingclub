<script lang="ts">
  type BadgeVariant = 'blue' | 'purple' | 'green' | 'yellow' | 'gray';
  type BadgeSize = 'sm' | 'md' | 'lg';

  let {
    variant = 'gray',
    size = 'md',
    children
  }: {
    variant?: BadgeVariant;
    size?: BadgeSize;
    children?: any;
  } = $props();

  const variantClasses = {
    blue: 'bg-blue-100 text-blue-900',
    purple: 'bg-purple-100 text-purple-900',
    green: 'bg-green-100 text-green-900',
    yellow: 'bg-yellow-100 text-yellow-900',
    gray: 'bg-gray-100 text-gray-900'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg'
  };

  const classes = `${variantClasses[variant]} ${sizeClasses[size]} rounded-full`;
</script>

<span class={classes}>
  {@render children()}
</span>
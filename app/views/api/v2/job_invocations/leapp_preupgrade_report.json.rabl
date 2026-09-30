node(:has_leapp_report) do |invocation|
  ::Helpers::JobHelper.with_leapp_report(invocation)
end

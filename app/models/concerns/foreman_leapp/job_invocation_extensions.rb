module ForemanLeapp
  module JobInvocationExtensions
    extend ActiveSupport::Concern

    included do
      has_many :preupgrade_reports
    end
  end
end
